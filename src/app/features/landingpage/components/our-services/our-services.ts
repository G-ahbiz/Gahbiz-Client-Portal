import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
  inject,
  ChangeDetectorRef,
  NgZone,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LandingFacadeService } from '@features/landingpage/services/landing-facade.service';
import { Category } from '@features/landingpage/interfaces/category';
import { filter, map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [TranslateModule, CommonModule, NgOptimizedImage],
  templateUrl: './our-services.html',
  styleUrl: './our-services.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OurServices implements OnInit, OnDestroy {
  @Input() isArabic: boolean = false;

  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  services$!: Observable<ServiceSlide[]>;
  services: ServiceSlide[] = [];

  isLoading = true;

  // slider state
  currentIndex = 0;
  private autoplayInterval: ReturnType<typeof setInterval> | null = null;
  private readonly autoplayDelay = 4500;

  // Responsive state
  isMobile = false;
  isTablet = false;

  // touch handling
  private touchStartX = 0;
  private touchEndX = 0;
  private readonly minSwipeDistance = 40;

  // Cache for slide styles
  private slideStyleCache = new Map<string, Record<string, string | number>>();

  constructor(
    private landingFacade: LandingFacadeService,
    @Inject(PLATFORM_ID) private platformId: any,
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    // Defer services to prevent carousel from becoming LCP
    setTimeout(() => this.loadServices(), 100);
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.destroy$.next();
    this.destroy$.complete();
    this.slideStyleCache.clear();
  }

  @HostListener('window:resize')
  onResize() {
    // Debounce resize events
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.checkScreenSize();
          this.clearStyleCache(); // Clear cache on resize
        });
      }, 100);
    });
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      this.isMobile = width < 768;
      this.isTablet = width >= 768 && width < 1200;
    }
  }

  private loadServices(): void {
    this.isLoading = true;
    this.landingFacade.loadCategories();

    this.services$ = this.landingFacade.categories$.pipe(
      startWith([] as Category[]), // 👈 السطر السحري
      filter((cats: Category[] | null) => Array.isArray(cats)),
      map((categories: Category[]) => categories.map((c) => this.mapCategoryToSlide(c))),
      tap((mappedServices) => {
        this.services = mappedServices;
        this.isLoading = false;
        this.currentIndex = 0;
        this.clearStyleCache();

        if (mappedServices.length > 1) {
          this.startAutoplay();
        } else {
          this.stopAutoplay();
        }

        this.ngZone.runOutsideAngular(() => {
          setTimeout(() => this.cdr.detectChanges(), 0);
        });
      }),
      takeUntil(this.destroy$),
    );

    // Subscribe to trigger the observable pipeline
    this.services$.subscribe();
  }

  private mapCategoryToSlide(c: Category) {
    return {
      title: c.name ?? 'Untitled Service',
      caption: c.description ?? '',
      serviceCount: c.serviceCount ?? 0,
      image: c.images?.[0] || 'assets/images/placeholder.jpg',
      category: c.id,
    };
  }

  private clearStyleCache() {
    this.slideStyleCache.clear();
  }

  // Image optimization with Cloudinary transformations
  // Image optimization with responsive transformations for mobile-first
  getOptimizedImage(imageUrl: string, index: number): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return 'assets/images/placeholder.jpg';
    }

    try {
      // Check if it's a Cloudinary URL
      if (imageUrl.includes('res.cloudinary.com')) {
        // Get viewport width for mobile optimization
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1200 && window.innerWidth > 768;

        // Mobile-first responsive widths
        let targetWidth = 380; // Default for mobile (from your CSS: max-width: 380px)

        if (isTablet) {
          targetWidth = 480; // Tablet
        } else if (!isMobile && !isTablet) {
          targetWidth = 560; // Desktop
        }

        // For mobile, we can use more aggressive compression
        const quality = isMobile ? 'q_auto:low' : 'q_auto:good';

        // Mobile-optimized transformations
        const transformations = `f_auto,${quality},w_${targetWidth},c_limit,dpr_auto`;

        // Find the upload path and insert transformations after it
        const uploadIndex = imageUrl.indexOf('/upload/');
        if (uploadIndex !== -1) {
          return (
            imageUrl.slice(0, uploadIndex + 8) +
            transformations +
            '/' +
            imageUrl.slice(uploadIndex + 8)
          );
        }
      }

      // Validate URL
      new URL(imageUrl, window.location.origin);
      return imageUrl;
    } catch {
      console.warn(`Invalid image URL for slide ${index}:`, imageUrl);
      return 'assets/images/placeholder.jpg';
    }
  }

  onImageLoad(event: Event): void {
    try {
      const img = event.target as HTMLImageElement;
      img.classList.add('loaded');
    } catch (e) {
      console.warn('Image load handler error:', e);
    }
  }

  // AUTOPLAY with performance optimization
  startAutoplay() {
    this.stopAutoplay();
    if (this.services.length > 1) {
      // Run interval outside Angular zone to prevent unnecessary change detection
      this.ngZone.runOutsideAngular(() => {
        this.autoplayInterval = setInterval(() => {
          this.ngZone.run(() => {
            this.navigateNext();
          });
        }, this.autoplayDelay);
      });
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  // NAVIGATION with cache invalidation
  navigateNext() {
    this.stopAutoplay();
    if (!this.services || this.services.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.services.length;
    this.clearStyleCache();
    this.cdr.markForCheck();
    this.startAutoplay();
  }

  navigatePrev() {
    this.stopAutoplay();
    if (!this.services || this.services.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.services.length) % this.services.length;
    this.clearStyleCache();
    this.cdr.markForCheck();
    this.startAutoplay();
  }

  // Cached slide style calculation
  getSlideStyle(i: number): Record<string, string | number> {
    const cacheKey = `${i}-${this.currentIndex}-${this.isMobile}-${this.isTablet}-${this.isArabic}`;

    if (this.slideStyleCache.has(cacheKey)) {
      return this.slideStyleCache.get(cacheKey)!;
    }

    const style = this.calculateSlideStyle(i);
    this.slideStyleCache.set(cacheKey, style);
    return style;
  }

  private calculateSlideStyle(i: number): Record<string, string | number> {
    if (this.isMobile) {
      return this.getMobileSlideStyle(i);
    } else if (this.isTablet) {
      return this.getTabletSlideStyle(i);
    } else {
      return this.getDesktopSlideStyle(i);
    }
  }

  private getDesktopSlideStyle(i: number): Record<string, string | number> {
    const n = this.services.length || 1;
    let diff = i - this.currentIndex;

    // Normalize diff for circular carousel
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;

    let translateX = diff * 95;
    let scale = 0.62;
    let z = 1;
    let imageOpacity = 0.45;
    let slideVisibility = 'visible';
    let detailsOpacity = 0;
    let detailsScale = 0.8;

    if (diff === 0) {
      scale = 1.2;
      imageOpacity = 1;
      z = 30;
      translateX = 0;
      detailsOpacity = 1;
      detailsScale = 1;
    } else if (Math.abs(diff) === 1) {
      scale = 0.58;
      imageOpacity = 0.95;
      z = 20;
      detailsOpacity = 1;
      detailsScale = 0.8;
    } else {
      scale = 0.58;
      imageOpacity = 0;
      z = 5;
      slideVisibility = 'hidden';
      detailsOpacity = 0;
    }

    const dirSign = this.isArabic ? -1 : 1;
    const finalTranslateX = translateX * dirSign - 50;

    return {
      transform: `translateX(${finalTranslateX}%) scale(${scale})`,
      'z-index': z,
      '--image-opacity': imageOpacity,
      visibility: slideVisibility,
      '--details-opacity': detailsOpacity,
      '--details-scale': detailsScale,
    };
  }

  private getTabletSlideStyle(i: number): Record<string, string | number> {
    const n = this.services.length || 1;
    let diff = i - this.currentIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;

    let translateX = diff * 80;
    let scale = 0.7;
    let z = 1;
    let imageOpacity = 0.6;
    let detailsOpacity = 0;
    let detailsScale = 0.8;

    if (diff === 0) {
      scale = 1.1;
      imageOpacity = 1;
      z = 30;
      translateX = 0;
      detailsOpacity = 1;
      detailsScale = 1;
    } else if (Math.abs(diff) === 1) {
      scale = 0.65;
      imageOpacity = 0.8;
      z = 20;
      detailsOpacity = 0.8;
      detailsScale = 0.7;
    } else {
      scale = 0.6;
      imageOpacity = 0.3;
      z = 5;
      detailsOpacity = 0;
    }

    const dirSign = this.isArabic ? -1 : 1;
    const finalTranslateX = translateX * dirSign - 50;
    const transform = `translateX(${finalTranslateX}%) scale(${scale})`;

    return {
      transform,
      'z-index': z,
      '--image-opacity': imageOpacity,
      visibility: 'visible',
      '--details-opacity': detailsOpacity,
      '--details-scale': detailsScale,
    };
  }

  private getMobileSlideStyle(i: number): Record<string, string | number> {
    const diff = i - this.currentIndex;
    const baseTranslateX = diff * 105;

    const finalTranslateX = baseTranslateX - 50;
    const transform = `translateX(${finalTranslateX}%) scale(1)`;

    const isActive = i === this.currentIndex;

    return {
      transform,
      'z-index': isActive ? 30 : 1,
      '--image-opacity': 1,
      visibility: 'visible',
      '--details-opacity': isActive ? 1 : 0,
      '--details-scale': isActive ? 1 : 0.8,
    };
  }

  onTouchStart(e: TouchEvent) {
    this.stopAutoplay();
    this.touchStartX = e.changedTouches[0].clientX;
  }

  onTouchEnd(e: TouchEvent) {
    this.touchEndX = e.changedTouches[0].clientX;
    const delta = this.touchEndX - this.touchStartX;

    if (Math.abs(delta) > this.minSwipeDistance) {
      if (delta < 0) {
        this.isArabic ? this.navigatePrev() : this.navigateNext();
      } else {
        this.isArabic ? this.navigateNext() : this.navigatePrev();
      }
    } else {
      this.startAutoplay();
    }
  }

  retryLoadServices(): void {
    this.isLoading = true;
    this.services = [];
    this.stopAutoplay();
    this.landingFacade.loadCategories(true);
  }

  navigateToCategory(categoryId: string) {
    if (!categoryId) return;
    this.router.navigate(['/all-services'], {
      queryParams: { categoryId },
    });
  }

  navigateToAllServices() {
    this.router.navigate(['/all-services']);
  }

  trackById(index: number, item: ServiceSlide): string {
    return item.category;
  }
}
