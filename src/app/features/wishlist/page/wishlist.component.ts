import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil, filter, take } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { AuthService } from '@core/services/auth.service';
import { WishlistService } from '@core/services/wishlist.service';
import { ServiceDetails } from '@features/all-services/interfaces/all-services/service-details';
import { ServicesDetailsApiService } from '@features/all-services/services/services-details/services-details-api.service';
import { ToastService } from '@shared/services/toast.service';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { ProfileFacadeService } from '@features/complete-profile/services/profile-facade.service';
import { Profile } from '@features/complete-profile/interfaces/profile';
import { ROUTES } from '@shared/config/constants';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, Navbar, Footer],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
})
export class WishlistComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cartFacadeService = inject(CartFacadeService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  readonly wishlistItems = signal<ServiceDetails[]>([]);
  readonly isLoading = signal(true);
  readonly isRemoving = signal<{ [key: string]: boolean }>({});
  readonly currentLang = signal('en');

  constructor(
    private wishlistService: WishlistService,
    private servicesDetailsApiService: ServicesDetailsApiService,
    private toast: ToastService,
    private translate: TranslateService,
    private profileFacade: ProfileFacadeService,
  ) {}

  ngOnInit() {
    this.initializeTranslation();
    this.loadWishlistData();
  }

  private loadWishlistData(): void {
    // Initialize wishlist service
    this.wishlistService.initWishlist();

    // Subscribe to wishlist changes and wait for the actual data
    this.wishlistService.wishlist$
      .pipe(
        // Filter out the initial null value
        filter((ids) => ids !== null),
        // Take only the first non-null value (the actual loaded wishlist)
        take(1),
        switchMap((serviceIds) => {
          console.log('Loaded service IDs:', serviceIds); // Debug log

          if (serviceIds.length === 0) {
            return of([]);
          }

          const requests = serviceIds.map((id) =>
            this.servicesDetailsApiService.getServiceById(id).pipe(
              catchError((err) => {
                console.error(`Error loading service ${id}:`, err);
                return of(null);
              }),
            ),
          );

          return forkJoin(requests);
        }),
        map((services) =>
          services.filter((s): s is any => s !== null).map((s) => this.mapToServiceDetails(s)),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (items) => {
          console.log('Final wishlist items:', items); // Debug log
          this.wishlistItems.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading wishlist items:', err);
          this.toast.error(this.translate.instant('WISHLIST.LOAD_ERROR'));
          this.wishlistItems.set([]);
          this.isLoading.set(false);
        },
      });
  }

  // Alternative approach: Direct loading without relying on the BehaviorSubject stream
  private loadWishlistDataDirect(): void {
    this.isLoading.set(true);

    // Directly call loadWishlist and wait for the response
    this.wishlistService
      .loadWishlist()
      .pipe(
        switchMap((serviceIds) => {
          console.log('Direct load - service IDs:', serviceIds); // Debug log

          if (serviceIds.length === 0) {
            return of([]);
          }

          const requests = serviceIds.map((id) =>
            this.servicesDetailsApiService.getServiceById(id).pipe(
              catchError((err) => {
                console.error(`Error loading service ${id}:`, err);
                return of(null);
              }),
            ),
          );

          return forkJoin(requests);
        }),
        map((services) =>
          services.filter((s): s is any => s !== null).map((s) => this.mapToServiceDetails(s)),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (items) => {
          console.log('Direct load - final items:', items); // Debug log
          this.wishlistItems.set(items);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error in direct wishlist load:', err);
          this.toast.error(this.translate.instant('WISHLIST.LOAD_ERROR'));
          this.wishlistItems.set([]);
          this.isLoading.set(false);
        },
      });
  }

  private initializeTranslation(): void {
    try {
      const savedLang = localStorage.getItem('servabest-language') || 'en';
      this.translate.setDefaultLang('en');
      this.translate.use(savedLang);
      this.currentLang.set(savedLang);

      this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event) => {
          this.currentLang.set(event.lang);
        },
        error: (error) => {
          console.error('Language change error in WishlistComponent:', error);
        },
      });
    } catch (error) {
      console.error('Translation initialization failed in WishlistComponent:', error);
      this.currentLang.set('en');
    }
  }

  private mapToServiceDetails(serviceDetails: any): ServiceDetails {
    const sd = serviceDetails?.service ?? serviceDetails?.data ?? serviceDetails;
    const mainImage = sd.images && sd.images.length > 0 ? sd.images[0] : null;
    const currentPrice = sd.price ?? 0;
    const originalPriceFromApi = sd.priceBefore ?? 0;
    const finalPriceBefore =
      originalPriceFromApi > currentPrice ? originalPriceFromApi : currentPrice;

    return {
      id: sd.id,
      name: sd.name,
      description: sd.description || this.translate.instant('WISHLIST.NO_DESCRIPTION'),
      price: currentPrice,
      priceBefore: finalPriceBefore,
      deliveryTime: sd.deliveryTime ?? 0,
      deliveryTimeRate: sd.deliveryTimeRate || 'days',
      deliveryType: sd.deliveryType || 'standard',
      currency: sd.currency || 'USD',
      categoryId: sd.categoryId,
      image: mainImage,
      active: sd.active !== false,
      rate: sd.rating ?? sd.rate ?? 0,
      rateCount: sd.reviewCount ?? sd.rateCount ?? 0,
      tags: sd.tags || null,
    };
  }

  removeFromWishlist(serviceId: string, event: Event): void {
    event.stopPropagation();

    if (this.isRemoving()[serviceId]) return;

    this.isRemoving.update((state) => ({ ...state, [serviceId]: true }));

    this.wishlistService.remove(serviceId).subscribe({
      next: () => {
        this.wishlistItems.update((items) => items.filter((item) => item.id !== serviceId));
        this.isRemoving.update((state) => {
          const newState = { ...state };
          delete newState[serviceId];
          return newState;
        });
      },
      error: (err) => {
        console.error('Error removing from wishlist:', err);
        this.isRemoving.update((state) => {
          const newState = { ...state };
          delete newState[serviceId];
          return newState;
        });
      },
    });
  }

  getServiceImage(service: ServiceDetails): string {
    return service.image?.path || 'assets/images/placeholder.jpg';
  }

  hasDiscount(service: ServiceDetails): boolean {
    return service.priceBefore > service.price;
  }

  navigateToServiceDetails(serviceId: string): void {
    this.router.navigate(['/service-details', serviceId]);
  }

  onAddToCart(service: ServiceDetails, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.toast.error('Please sign in to add items to your cart', 3000);
      return;
    }

    const cartItem = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      priceBefore: service.priceBefore,
      rate: service.rate,
      image: this.getServiceImage(service),
      rateCount: service.rateCount,
      quantity: 1,
    };

    const result = this.cartFacadeService.addToCart(cartItem);
    if (result) {
      this.toast.success('Item added to cart', 3000);
    } else {
      this.toast.error('Item already in cart', 3000);
    }
  }

  onBuyNow(service: ServiceDetails, event: Event): void {
    event.stopPropagation();
    this.onAddToCart(service, event);

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
              this.toast.error('Please complete your profile to proceed to checkout');
              this.router.navigate([ROUTES.completeProfile]);
            } else {
              this.router.navigate([ROUTES.checkout]);
            }
          } else {
            this.toast.error('Please complete your profile to proceed to checkout');
            this.router.navigate([ROUTES.completeProfile]);
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.toast.error('Please complete your profile to proceed to checkout');
          this.router.navigate([ROUTES.completeProfile]);
        },
      });
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

  trackByServiceId(index: number, service: ServiceDetails): string {
    return service.id;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
