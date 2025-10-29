import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { MenuItem } from 'primeng/api';
import { RatingModule } from 'primeng/rating';
import { ServicesComponent } from './services-component/services-component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AllServicePageFacadeService } from './services/all-service-page-facade.service';
import { PaginatedServices } from './interfaces/paginated-services';
import { ServiceCategory } from './interfaces/service-category';
import { ServiceDetails } from './interfaces/service-details';
import { PaginatedCategories } from './interfaces/paginated-categories';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';

interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
  command?: () => void;
}

@Component({
  selector: 'app-all-services',
  imports: [
    TranslateModule,
    Navbar,
    Footer,
    RatingModule,
    ServicesComponent,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './all-services.html',
  styleUrls: ['./all-services.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllServices implements OnInit, OnDestroy {
  private translateService = inject(TranslateService);
  private facadeService = inject(AllServicePageFacadeService);
  private toastService = inject(ToastService);

  private route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  // Add ViewChild to reference the services container
  @ViewChild('servicesContainer', { static: false })
  servicesContainer!: ElementRef<HTMLElement>;

  // Language state using signals
  readonly currentLang = signal<string>('en');
  readonly isRTL = computed(() => this.currentLang() === 'ar');

  // breadcrumb
  readonly breadcrumbItems = signal<BreadcrumbItem[]>([]);
  readonly home = signal<MenuItem | undefined>(undefined);

  // Loading and data states
  readonly isLoading = signal(false);
  readonly categoryPagination = signal<PaginatedCategories | null>(null);
  readonly allCategoryFilters = signal<ServiceCategory[]>([]);
  readonly singleCategoryServices = signal<PaginatedServices | null>(null);
  readonly activeCategoryId = signal<string | null>(null);
  readonly singleCategoryTitle = signal('');

  // Computed signals for derived state
  readonly hasCategoryData = computed(() => !!this.categoryPagination()?.items?.length);
  readonly hasSingleCategoryData = computed(() => !!this.singleCategoryServices()?.items?.length);
  readonly isAllServicesView = computed(() => this.activeCategoryId() === null);
  readonly shouldShowMainPagination = computed(() => {
    const pagination = this.categoryPagination();
    return pagination && pagination.totalPages > 1;
  });

  // Constants
  readonly categoriesPageSize = 4;
  readonly servicesPageSize = 4;

  ngOnInit() {
    this.initializeTranslation();
    this.home.set({ icon: 'pi pi-home', routerLink: '/home' });

    // Check the URL for a categoryId
    const categoryIdFromRoute = this.route.snapshot.queryParamMap.get('categoryId');

    this.facadeService
      .getCategoryFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            this.allCategoryFilters.set(res.data.items);
          }

          if (categoryIdFromRoute && res.succeeded && res.data) {
            const foundCategory = res.data.items.find((c: ServiceCategory) => c.id === categoryIdFromRoute);

            if (foundCategory) {
              this.onFilterChange(foundCategory);
            } else {
              console.warn('Category ID from route not found, loading all categories.');
              this.loadCategories(1);
              this.updateBreadcrumb();
            }
          } else if (!categoryIdFromRoute) {
            this.loadCategories(1);
            this.updateBreadcrumb();
          } else {
            this.loadCategories(1);
            this.updateBreadcrumb();
          }
        },
        error: (error) => {
          this.handleError('load_category_filters', error);
          this.loadCategories(1);
          this.updateBreadcrumb();
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialize translation with proper error handling
   */
  private initializeTranslation(): void {
    try {
      const savedLang = localStorage.getItem('servabest-language') || 'en';
      this.setLanguage(savedLang);

      this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event: LangChangeEvent) => this.handleLanguageChange(event),
        error: (error) => console.error('Language change error:', error),
      });
    } catch (error) {
      console.error('Translation initialization failed:', error);
      this.setLanguage('en'); // Fallback to English
    }
  }

  private setLanguage(lang: string): void {
    this.translateService.setDefaultLang('en');
    this.translateService.use(lang);
    this.currentLang.set(lang);

    const direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);
  }

  private handleLanguageChange(event: LangChangeEvent): void {
    this.currentLang.set(event.lang);

    const direction = event.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', direction);

    this.updateBreadcrumb();
  }

  /**
   * Fetches a page of ALL CATEGORIES for the "All" view
   */
  loadCategories(page: number): void {
    this.isLoading.set(true);

    this.facadeService
      .getCategories(page, this.categoriesPageSize, true, this.servicesPageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading.set(false);
          // Scroll to top after categories are loaded
          this.scrollToServicesTop();
        })
      )
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            this.categoryPagination.set(res.data);
          } else {
            this.handleEmptyResponse('categories');
          }
        },
        error: (error) => this.handleError('load_categories', error),
      });
  }

  /**
   * Fetches ALL category names for the filter buttons at the top
   */
  loadCategoryFilters(): void {
    this.facadeService
      .getCategoryFilters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            this.allCategoryFilters.set(res.data.items);
          }
        },
        error: (error) => this.handleError('load_category_filters', error),
      });
  }

  /**
   * Handles click events from the filter buttons
   */
  onFilterChange(category: ServiceCategory | null): void {
    if (category === null) {
      // "All Services" view
      this.activeCategoryId.set(null);
      this.singleCategoryServices.set(null);
      this.loadCategories(1);
    } else {
      // Specific category view
      this.activeCategoryId.set(category.id);
      this.singleCategoryTitle.set(category.name);
      this.categoryPagination.set(null);
      this.loadServicesForCategory(category.id, 1);
    }

    this.updateBreadcrumb();
    this.scrollToContent();
  }

  /**
   * Fetches services for ONLY ONE category
   */
  loadServicesForCategory(categoryId: string, page: number): void {
    this.isLoading.set(true);

    this.facadeService
      .getServicesByCategory(categoryId, page, this.servicesPageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading.set(false);
          // Scroll to top after single category services are loaded
          this.scrollToServicesTop();
        })
      )
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            this.singleCategoryServices.set(res.data);
          } else {
            this.handleEmptyResponse('services');
          }
        },
        error: (error) => this.handleError('load_services', error),
      });
  }

  /**
   * Handles the MAIN pagination at the BOTTOM of the page
   */
  onCategoryPageChange(event: { page: number; pageSize: number }): void {
    this.loadCategories(event.page);
  }

  /**
   * Handles pagination CLICKS INSIDE a single category component
   */
  onServicePageChange(event: { page: number; pageSize: number }, categoryId: string): void {
    if (this.activeCategoryId() === null) {
      this.updateCategoryServices(categoryId, event.page, event.pageSize);
    } else {
      this.loadServicesForCategory(this.activeCategoryId()!, event.page);
    }
  }

  private updateCategoryServices(categoryId: string, page: number, pageSize: number): void {
    const currentData = this.categoryPagination();
    if (!currentData) return;
    const category = currentData.items.find((c: ServiceCategory) => c.id === categoryId);

    if (!category) return;

    this.facadeService
      .getServicesByCategory(categoryId, page, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            const updatedItems = currentData.items.map((c: ServiceCategory) =>
              c.id === categoryId ? { ...c, services: res.data } : c
            );
            this.categoryPagination.set({ ...currentData, items: updatedItems });
          }
        },
        error: (error) => this.handleError('update_category_services', error),
      });
  }

  /** Updates breadcrumb based on the active category */
  updateBreadcrumb(): void {
    const servicesLabel = this.translateService.instant('all-services.breadcrumb_services');
    const newBreadcrumbItems: BreadcrumbItem[] = [];

    if (this.activeCategoryId() === null) {
      // "All Services" view
      newBreadcrumbItems.push({
        label: servicesLabel,
        isActive: true,
      });
    } else {
      // Specific category view
      newBreadcrumbItems.push({
        label: servicesLabel,
        isActive: false,
        command: () => this.onFilterChange(null),
      });
      newBreadcrumbItems.push({
        label: this.singleCategoryTitle(),
        isActive: true,
      });
    }

    this.breadcrumbItems.set(newBreadcrumbItems);
  }

  /** Handles the MAIN pagination for "All Categories" (Previous) */
  onCategoryPreviousPage(): void {
    const pagination = this.categoryPagination();
    if (pagination?.hasPreviousPage) {
      this.loadCategories(pagination.pageNumber - 1);
    }
  }

  /** Handles the MAIN pagination for "All Categories" (Next) */
  onCategoryNextPage(): void {
    const pagination = this.categoryPagination();
    if (pagination?.hasNextPage) {
      this.loadCategories(pagination.pageNumber + 1);
    }
  }

  /**
   * Scrolls the view to the top of the services content area (tabs)
   */
  private scrollToContent(): void {
    requestAnimationFrame(() => {
      const element = document.querySelector('.tabs-wrapper') as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /**
   * Scrolls to the top of the services categories
   */
  private scrollToServicesTop(): void {
    requestAnimationFrame(() => {
      // Try multiple selectors to find the services container
      const selectors = [
        '#services-content-container',
        '.services-content-container',
        '.d-flex.flex-column.justify-content-center.align-items-center.gap-5.py-5',
      ];

      let targetElement: HTMLElement | null = null;

      for (const selector of selectors) {
        targetElement = document.querySelector(selector);
        if (targetElement) break;
      }

      // Fallback to the first services component or the content area
      if (!targetElement) {
        targetElement =
          document.querySelector('app-services-component') ||
          document.querySelector(
            '.d-flex.flex-column.justify-content-center.align-items-center.gap-5.py-5'
          );
      }

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    });
  }

  /**
   * Error handling utility - Only show toasts for critical errors
   */
  private handleError(context: string, error: any): void {
    console.error(`${context} failed:`, error);
    this.isLoading.set(false);

    // Only show toast for critical network/API errors
    // Don't show for empty responses or validation errors
    if (this.isCriticalError(error)) {
      const errorMessage = this.translateService.instant(`all-services.toast.${context}_error`);
      this.toastService.error(
        errorMessage || this.translateService.instant('all-services.toast.generic_error')
      );
    }
  }

  /**
   * Determine if an error is critical enough to show a toast
   */
  private isCriticalError(error: any): boolean {
    // Show toast for network errors, server errors, and timeouts
    if (error.status === 0) return true; // Network error
    if (error.status >= 500) return true; // Server error
    if (error.status === 408) return true; // Timeout
    if (error.name === 'TimeoutError') return true;

    // Don't show toast for client errors (4xx) unless it's critical
    if (error.status === 404) return false; // Not found - handled by UI
    if (error.status === 400) return false; // Bad request - handled by validation

    return false; // Default: don't show toast
  }

  private handleEmptyResponse(context: string): void {
    console.warn(`Empty response received for ${context}`);
    // No toast for empty responses - UI shows appropriate message
  }

  // TrackBy functions for optimal ngFor performance
  trackByCategoryId(index: number, category: ServiceCategory): string {
    return category.id;
  }

  trackByServiceId(index: number, service: ServiceDetails): string {
    return service.id;
  }

  trackByBreadcrumbItem(index: number, item: BreadcrumbItem): string {
    return item.label;
  }
}
