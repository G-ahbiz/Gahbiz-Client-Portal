import {
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { Rating } from '@shared/components/rating/rating';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CustomGalleryComponent } from '@shared/components/custom-gallery/custom-gallery.component';
import { ServicesDetailsFacadeService } from '../../services/services-details/services-details-facade.service';
import { ServicesDetailsResponse } from '@features/all-services/interfaces/services-details/services-details-response';
import { CurrencyService } from '@shared/services/currency.service';
import { ServiceDetails } from '@features/all-services/interfaces/all-services/service-details';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { ToastService } from '@shared/services/toast.service';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';

interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
  command?: () => void;
}

@Component({
  selector: 'app-service-details-content',
  standalone: true,
  imports: [TranslateModule, CustomGalleryComponent, FormsModule, Rating, RouterLink, CommonModule],
  templateUrl: './service-details-content.html',
  styleUrl: './service-details-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailsContent implements OnInit {
  private readonly DEFAULT_LANGUAGE = 'en';
  public readonly MIN_SERVICE_COUNTER = 1;
  private readonly DESCRIPTION_TRUNCATION_LENGTH = 200;
  private readonly SCROLL_DELAY_MS = 300;

  // Dependency Injection
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly servicesDetailsFacade = inject(ServicesDetailsFacadeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly currencyService = inject(CurrencyService);
  private readonly toaster = inject(ToastService);
  private readonly cartFacadeService = inject(CartFacadeService);
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });
  // State Management
  readonly isLoading = signal<boolean>(true);
  readonly serviceDetail = signal<ServicesDetailsResponse | null>(null);
  readonly error = signal<string | null>(null);
  readonly currentLang = signal<string>(this.DEFAULT_LANGUAGE);

  // UI State
  readonly breadcrumbItems = signal<BreadcrumbItem[]>([]);
  readonly home = signal<MenuItem | undefined>(undefined);
  readonly serviceCounter = signal<number>(this.MIN_SERVICE_COUNTER);

  // Computed Properties
  readonly imageUrls = computed(() => {
    const service = this.serviceDetail();
    return service?.images?.map((img) => img.path) ?? [];
  });

  readonly currencyInfo = computed(() => {
    const service = this.serviceDetail();
    const currencyCode = service?.currency ?? 'USD';
    return this.currencyService.getCurrencyInfo(currencyCode);
  });

  readonly isDescriptionLong = computed(() => {
    const service = this.serviceDetail();
    return (service?.description?.length ?? 0) > this.DESCRIPTION_TRUNCATION_LENGTH;
  });

  readonly currencySymbol = computed(() => this.currencyInfo().symbol);
  readonly hasDiscount = computed(() => {
    const service = this.serviceDetail();
    return !!(service?.priceBefore && service.priceBefore > service.price);
  });

  readonly discountPercentage = computed(() => {
    const service = this.serviceDetail();
    if (!this.hasDiscount() || !service?.priceBefore) return 0;
    return Math.round(((service.priceBefore - service.price) / service.priceBefore) * 100);
  });

  constructor() {
    this.setupLanguageSubscription();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Initialize component
   */
  private initializeComponent(): void {
    this.initializeTranslation();
    this.initializeHomeBreadcrumb();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.isLoading.set(true);
      this.error.set(null);

      const serviceId = params.get('id');

      if (!this.isValidServiceId(serviceId)) {
        this.handleInvalidServiceId();
      } else {
        this.fetchServiceDetails(serviceId);
      }
    });
  }

  /**
   * Set up language change subscription
   */
  private setupLanguageSubscription(): void {
    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (event: LangChangeEvent) => {
        this.currentLang.set(event.lang);
        this.updateBreadcrumb();
      },
      error: (error) => {
        console.error('Language change subscription error:', error);
      },
    });
  }

  /**
   * Initialize translation settings
   */
  private initializeTranslation(): void {
    try {
      const savedLang = localStorage.getItem('servabest-language') ?? this.DEFAULT_LANGUAGE;
      this.translateService.setDefaultLang(this.DEFAULT_LANGUAGE);
      this.translateService.use(savedLang);

      this.setDocumentDirection(savedLang);
      this.currentLang.set(savedLang);
    } catch (error) {
      console.error('Translation initialization failed:', error);
      this.fallbackToDefaultLanguage();
    }
  }

  /**
   * Set document direction based on language
   */
  private setDocumentDirection(language: string): void {
    const isRTL = language === 'ar';
    document.documentElement.style.direction = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }

  /**
   * Fallback to default language on error
   */
  private fallbackToDefaultLanguage(): void {
    this.translateService.use(this.DEFAULT_LANGUAGE);
    this.currentLang.set(this.DEFAULT_LANGUAGE);
    document.documentElement.style.direction = 'ltr';
  }

  /**
   * Initialize home breadcrumb
   */
  private initializeHomeBreadcrumb(): void {
    this.home.set({
      icon: 'pi pi-home',
      command: () => this.router.navigate(['/home']), // Use command for navigation
    });
  }

  /**
   * Load service details from API
   */
  public loadServiceDetails(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const serviceId = this.getServiceIdFromRoute();

    if (!this.isValidServiceId(serviceId)) {
      this.handleInvalidServiceId();
      return;
    }

    this.fetchServiceDetails(serviceId);
  }

  /**
   * Get service ID from route parameters
   */
  private getServiceIdFromRoute(): string | null {
    return this.route.snapshot.paramMap.get('id');
  }

  /**
   * Validate service ID
   */
  private isValidServiceId(serviceId: string | null): serviceId is string {
    return !!serviceId && serviceId.length > 0 && serviceId !== 'null' && serviceId !== 'undefined';
  }

  /**
   * Handle invalid service ID
   */
  private handleInvalidServiceId(): void {
    // TRANSLATED
    const errorMessage = this.translateService.instant('SERVICE_DETAILS.ERRORS.INVALID_SERVICE_ID');
    this.error.set(errorMessage);
    this.isLoading.set(false);
    this.cdr.markForCheck();
  }

  /**
   * Fetch service details from API
   */
  private fetchServiceDetails(serviceId: string): void {
    this.servicesDetailsFacade
      .getServiceDetails(serviceId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => this.handleServiceDetailsSuccess(data),
        error: (error) => this.handleServiceDetailsError(error),
      });
  }

  /**
   * Handle successful service details response
   */
  private handleServiceDetailsSuccess(data: ServicesDetailsResponse): void {
    if (!data) {
      this.handleEmptyResponse();
      return;
    }

    this.serviceDetail.set(data);
    this.updateBreadcrumb();
    this.cdr.markForCheck();

    window.scrollTo(0, 0);
  }

  /**
   * Handle empty API response
   */
  private handleEmptyResponse(): void {
    // TRANSLATED
    const errorMessage = this.translateService.instant('SERVICE_DETAILS.ERRORS.NO_SERVICE_DATA');
    this.error.set(errorMessage);
    console.warn('Empty service data received from API');
  }

  /**
   * Handle service details error
   */
  private handleServiceDetailsError(error: any): void {
    const userMessage = this.getUserFriendlyErrorMessage(error);
    this.error.set(userMessage);
    console.error('Service details fetch error:', error);
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyErrorMessage(error: any): string {
    // ALL TRANSLATED
    if (error.status === 0) {
      return this.translateService.instant('SERVICE_DETAILS.ERRORS.NETWORK_ERROR');
    } else if (error.status === 404) {
      return this.translateService.instant('SERVICE_DETAILS.ERRORS.SERVICE_NOT_FOUND');
    } else if (error.status >= 500) {
      return this.translateService.instant('SERVICE_DETAILS.ERRORS.SERVER_ERROR');
    } else {
      return this.translateService.instant('SERVICE_DETAILS.ERRORS.GENERIC_ERROR');
    }
  }

  /**
   * Refresh service details (for updating ratings after new review)
   */
  public refreshServiceDetails(): void {
    const serviceId = this.getServiceIdFromRoute();
    if (this.isValidServiceId(serviceId)) {
      this.fetchServiceDetails(serviceId);
    }
  }

  /**
   * Update breadcrumb navigation
   */
  private updateBreadcrumb(): void {
    const service = this.serviceDetail();
    if (!service) return;

    const breadcrumbItems: BreadcrumbItem[] = this.buildBreadcrumbItems(service);
    this.breadcrumbItems.set(breadcrumbItems);
  }

  /**
   * Build breadcrumb items array
   */
  private buildBreadcrumbItems(service: ServicesDetailsResponse): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
      this.createServicesBreadcrumbItem(),
      ...this.createCategoryBreadcrumbItems(service),
      this.createServiceBreadcrumbItem(service),
    ];

    return items;
  }

  /**
   * Create services breadcrumb item
   */
  private createServicesBreadcrumbItem(): BreadcrumbItem {
    // Using BREADCRUMB.SERVICES key
    const label = this.translateService.instant('BREADCRUMB.SERVICES') || 'Our Services';
    return {
      label,
      isActive: false,
      command: () => this.navigateToAllServices(),
    };
  }

  /**
   * Create category breadcrumb items
   */
  private createCategoryBreadcrumbItems(service: ServicesDetailsResponse): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];

    if (service.categoryName && service.categoryId) {
      items.push({
        label: service.categoryName, // This comes from the API, so it's assumed to be in the correct language
        isActive: false,
        command: () => this.navigateToCategory(service.categoryId),
      });
    }

    return items;
  }

  /**
   * Create service breadcrumb item
   */
  private createServiceBreadcrumbItem(service: ServicesDetailsResponse): BreadcrumbItem {
    return {
      label: service.name, // This also comes from the API
      isActive: true,
    };
  }

  /**
   * Navigate to all services page
   */
  private navigateToAllServices(): void {
    this.router.navigate(['/all-services']);
  }

  /**
   * Navigate to category page
   */
  private navigateToCategory(categoryId: string): void {
    this.router.navigate(['/all-services'], {
      queryParams: { categoryId },
    });
  }

  // Public Methods

  /**
   * Format price with currency symbol
   */
  formatPrice(price: number | undefined): string {
    if (price === undefined || price === null) {
      // TRANSLATED
      return this.translateService.instant('COMMON.NOT_AVAILABLE');
    }

    const symbol = this.currencySymbol();
    return `${symbol}${price.toLocaleString()}`;
  }

  /**
   * Navigate to description tab
   */
  navigateToDescriptionTab(): void {
    try {
      // Method 1: Using URL fragment
      this.router
        .navigate([], {
          fragment: 'description',
          relativeTo: this.route,
        })
        .then(() => {
          this.scrollToTabsSection();
        })
        .catch((error) => {
          console.error('Navigation to description tab failed:', error);
          this.fallbackToDescriptionTab();
        });
    } catch (error) {
      console.error('Error navigating to description tab:', error);
      this.fallbackToDescriptionTab();
    }
  }

  /**
   * Scroll to tabs section
   */
  private scrollToTabsSection(): void {
    setTimeout(() => {
      const tabsSection = document.querySelector('.service-details-tabs-container');
      if (tabsSection) {
        tabsSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, this.SCROLL_DELAY_MS);
  }

  /**
   * Fallback method for description tab navigation
   */
  private fallbackToDescriptionTab(): void {
    const descriptionTab = document.querySelector('[data-tab="description"]') as HTMLElement;
    if (descriptionTab) {
      descriptionTab.click();
      this.scrollToTabsSection();
    }
  }

  /**
   * Increment service counter
   */
  incrementServiceCounter(): void {
    this.serviceCounter.update((current) => current + 1);
  }

  /**
   * Decrement service counter
   */
  decrementServiceCounter(): void {
    this.serviceCounter.update((current) =>
      current > this.MIN_SERVICE_COUNTER ? current - 1 : this.MIN_SERVICE_COUNTER
    );
  }

  /**
   * Add to cart functionality
   */
  onAddToCart(service: ServicesDetailsResponse, event: Event): void {
    event.stopPropagation(); // Prevent card click when button is clicked
    if (!this.isLoggedIn()) {
      this.toaster.error('Please sign in to add items to your cart', 3000);
      return;
    }
    const cartItem: CartItem = {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      priceBefore: service.priceBefore ?? 0,
      rate: service.rate,
      image: service.images[0]?.path ?? '',
      rateCount: service.rateCount,
    };
    const result = this.cartFacadeService.addToCart(cartItem);
    if (result) {
      this.toaster.success('Item added to cart', 3000);
    } else {
      this.toaster.error('Item already in cart', 3000);
    }
  }

  /**
   * Buy now functionality
   */
  buyNow(): void {
    const service = this.serviceDetail();
    if (service) {
      this.onAddToCart(service, new Event('click'));
      this.router.navigate([ROUTES.checkout]);
    }
  }

  /**
   * TrackBy function for breadcrumb items
   */
  trackByBreadcrumbItem(index: number, item: BreadcrumbItem): string {
    return `${item.label}-${index}`;
  }

  /**
   * Get delivery time display text
   */
  getDeliveryTimeDisplay(service: ServicesDetailsResponse): string {
    const time = service.deliveryTime || 30;
    const rate = (service.deliveryTimeRate || 'min').toLowerCase();

    // TRANSLATED
    let rateKey = 'SERVICE_DETAILS.TIME_UNITS.MINUTES'; // Default
    if (rate.startsWith('hour')) {
      rateKey = 'SERVICE_DETAILS.TIME_UNITS.HOURS';
    } else if (rate.startsWith('day')) {
      rateKey = 'SERVICE_DETAILS.TIME_UNITS.DAYS';
    }

    const rateTranslated = this.translateService.instant(rateKey);
    return `${time} ${rateTranslated}`;
  }

  /**
   * Get delivery rate display text
   */
  getDeliveryRateDisplay(): string {
    // TRANSLATED
    return this.translateService.instant('SERVICE_DETAILS.FREE_DELIVERY');
  }
}
