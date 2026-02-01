import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnDestroy,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule, NgClass } from '@angular/common';
import { PaginatedServices } from '../interfaces/all-services/paginated-services';
import { ServiceDetails } from '../interfaces/all-services/service-details';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { ToastService } from '@shared/services/toast.service';
import { AuthService } from '@core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ROUTES } from '@shared/config/constants';
import { ProfileFacadeService } from '@features/complete-profile/services/profile-facade.service';
import { Profile } from '@features/complete-profile/interfaces/profile';

@Component({
  selector: 'app-services-component',
  imports: [TranslateModule, Rating, PaginatorModule, CommonModule, NgClass],
  templateUrl: './services-component.html',
  styleUrls: ['./services-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnDestroy {
  private translateService = inject(TranslateService);
  private router = inject(Router);
  private cartFacadeService = inject(CartFacadeService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private profileFacade = inject(ProfileFacadeService);

  readonly isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });

  // Language state
  readonly currentLang = signal('en');
  readonly isRTL = signal(false);

  // Input properties with type safety
  @Input({ required: true }) serviceList: ServiceDetails[] = [];
  @Input({ required: true }) title: string = '';
  @Input() paginationData: PaginatedServices | null = null;

  @Output() pageChanged = new EventEmitter<{ page: number; pageSize: number }>();

  // Computed properties
  readonly shouldShowPagination = () => this.paginationData && this.paginationData.totalPages > 1;

  readonly getPageSize = (): number => 4;

  ngOnInit() {
    this.initializeTranslation();
  }

  /**
   * Initialize translation with proper error handling
   */
  private initializeTranslation(): void {
    try {
      const savedLang = localStorage.getItem('servabest-language') || 'en';
      this.translateService.setDefaultLang('en');
      this.translateService.use(savedLang);
      this.currentLang.set(savedLang);
      this.isRTL.set(savedLang === 'ar');

      this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event) => {
          this.currentLang.set(event.lang);
          this.isRTL.set(event.lang === 'ar');
        },
        error: (error) => {
          console.error('Language change error in ServicesComponent:', error);
        },
      });
    } catch (error) {
      console.error('Translation initialization failed in ServicesComponent:', error);
      this.currentLang.set('en');
      this.isRTL.set(false);
    }
  }

  onPreviousPage(): void {
    if (this.paginationData?.hasPreviousPage) {
      this.pageChanged.emit({
        page: this.paginationData.pageNumber - 1,
        pageSize: this.getPageSize(),
      });
    }
  }

  onNextPage(): void {
    if (this.paginationData?.hasNextPage) {
      this.pageChanged.emit({
        page: this.paginationData.pageNumber + 1,
        pageSize: this.getPageSize(),
      });
    }
  }

  // TrackBy function for optimal performance
  trackByServiceId(index: number, service: ServiceDetails): string {
    return service.id;
  }

  // Safe image URL fallback
  getServiceImage(service: ServiceDetails): string {
    return service.image?.path || 'assets/images/placeholder.jpg';
  }

  // Check if service has discount
  hasDiscount(service: ServiceDetails): boolean {
    return service.priceBefore > service.price;
  }

  // Get appropriate chevron direction based on language
  getChevronDirection(direction: 'left' | 'right'): string {
    if (this.currentLang() === 'ar') {
      return direction === 'left' ? 'pi-chevron-right' : 'pi-chevron-left';
    }
    return direction === 'left' ? 'pi-chevron-left' : 'pi-chevron-right';
  }

  navigateToServiceDetails(serviceId: string): void {
    this.router.navigate(['/service-details', serviceId]);
  }

  onBuyNow(service: ServiceDetails, event: Event): void {
    event.stopPropagation(); // Prevent card click when button is clicked
    if (service) {
      this.onAddToCart(service, new Event('click'));

      // Check if profile is complete before proceeding to checkout
      this.profileFacade
        .getProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response && response.succeeded && response.data) {
              const profile = response.data as Profile;
              const isProfileComplete = this.checkProfileComplete(profile);

              if (!isProfileComplete) {
                this.toastService.error('Please complete your profile to proceed to checkout');
                this.router.navigate([ROUTES.completeProfile]);
              } else {
                this.router.navigate([ROUTES.checkout]);
              }
            } else {
              this.toastService.error('Please complete your profile to proceed to checkout');
              this.router.navigate([ROUTES.completeProfile]);
            }
          },
          error: (error) => {
            console.error('Error loading profile:', error);
            this.toastService.error('Please complete your profile to proceed to checkout');
            this.router.navigate([ROUTES.completeProfile]);
          },
        });
    }
  }

  /**
   * Check if user profile is complete
   */
  private checkProfileComplete(profile: Profile): boolean {
    return !!(
      profile.fullName &&
      profile.email &&
      profile.phoneNumber &&
      profile.nationalId &&
      profile.dateOfBirth &&
      profile.country &&
      profile.state &&
      profile.postalCode &&
      profile.profileImageUrl
    );
  }

  onAddToCart(service: ServiceDetails, event: Event): void {
    event.stopPropagation(); // Prevent card click when button is clicked
    if (!this.isLoggedIn()) {
      this.toastService.error('Please sign in to add items to your cart', 3000);
      return;
    }
    const cartItem: CartItem = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      priceBefore: service.priceBefore,
      rate: service.rate,
      image: service.image?.path || '',
      rateCount: service.rateCount,
      quantity: 1,
    };
    const result = this.cartFacadeService.addToCart(cartItem);
    if (result) {
      this.toastService.success('Item added to cart', 3000);
    } else {
      this.toastService.error('Item already in cart', 3000);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
