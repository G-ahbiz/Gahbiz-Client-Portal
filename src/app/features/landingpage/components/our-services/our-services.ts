import { Component, HostListener, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Router } from '@angular/router';
import { LandingFacadeService } from '@features/landingpage/services/landing-facade.service';
import { Category } from '@features/landingpage/interfaces/category';
import { filter, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-our-services',
  standalone: true,
  imports: [TranslateModule, FormsModule, CarouselModule, ButtonModule, TagModule, CommonModule],
  templateUrl: './our-services.html',
  styleUrl: './our-services.scss',
})
export class OurServices implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  services: Array<any> = [];
  isLoading = true;

  // slider state
  currentIndex = 0;
  autoplayInterval: any = null;
  autoplayDelay = 4500;

  // RTL flags
  isArabic = false;
  isEnglish = false;
  isSpanish = false;

  // Responsive state
  isMobile = false;
  isTablet = false;

  // touch handling
  private touchStartX = 0;
  private touchEndX = 0;
  private minSwipeDistance = 40;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private landingFacade: LandingFacadeService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.initializeTranslation();

    // load categories from facade
    this.isLoading = true;
    this.landingFacade.loadCategories();

    this.landingFacade.categories$
      .pipe(
        filter((cats: Category[] | null) => Array.isArray(cats)),
        takeUntil(this.destroy$)
      )
      .subscribe((categories: Category[]) => {
        this.services = categories.map((c) => this.mapCategoryToSlide(c));
        this.currentIndex = 0;
        this.isLoading = false;

        // start autoplay if there are multiple items
        if (this.services.length > 1) {
          this.startAutoplay();
        } else {
          this.stopAutoplay();
        }
      });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      this.isMobile = width < 768;
      this.isTablet = width >= 768 && width < 1200;
    }
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

  private initializeTranslation() {
    if (!localStorage.getItem('servabest-language')) {
      localStorage.setItem('servabest-language', 'en');
    }
    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);

    if (savedLang === 'ar') {
      document.documentElement.style.direction = 'rtl';
    } else {
      document.documentElement.style.direction = 'ltr';
    }

    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: LangChangeEvent) => {
        this.isArabic = event.lang === 'ar';
        this.isEnglish = event.lang === 'en';
        this.isSpanish = event.lang === 'sp';
        document.documentElement.style.direction = this.isArabic ? 'rtl' : 'ltr';
      });
  }

  // AUTOPLAY helpers
  startAutoplay() {
    this.stopAutoplay();
    if ((this.services?.length ?? 0) > 1) {
      this.autoplayInterval = setInterval(() => this.navigateNext(), this.autoplayDelay);
    }
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  // NAVIGATION
  navigateNext() {
    this.stopAutoplay();
    if (!this.services || this.services.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.services.length;
    this.startAutoplay();
  }

  navigatePrev() {
    this.stopAutoplay();
    if (!this.services || this.services.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.services.length) % this.services.length;
    this.startAutoplay();
  }

  onServiceClick(item: any) {
    console.log('open service', item);
  }

  navigateToAllServices() {
    this.router.navigate(['/all-services']);
  }

  getSlideStyle(i: number) {
    if (this.isMobile) {
      return this.getMobileSlideStyle(i);
    } else if (this.isTablet) {
      return this.getTabletSlideStyle(i);
    } else {
      return this.getDesktopSlideStyle(i);
    }
  }

  private getDesktopSlideStyle(i: number) {
    const n = this.services.length || 1;
    let diff = i - this.currentIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;

    let translateX = diff * 95; // Base translation
    let scale = 0.62;
    let z = 1;
    let imageOpacity = 0.45;
    let slideVisibility = 'visible';
    let detailsOpacity = 0;
    let detailsScale = 0.8;

    if (diff === 0) {
      // Active slide
      scale = 1.2;
      imageOpacity = 1;
      z = 30;
      translateX = 0; // Override for center
      detailsOpacity = 1;
      detailsScale = 1;
    } else if (Math.abs(diff) === 1) {
      // Adjacent slides
      scale = 0.58;
      imageOpacity = 0.95;
      z = 20;
      detailsOpacity = 1;
      detailsScale = 0.8;
      // translateX remains (diff * 95)
    } else {
      // Far-off slides
      scale = 0.58;
      imageOpacity = 0; // Fade out
      z = 5;
      // translateX remains (diff * 95) - This is the fix!
      slideVisibility = 'hidden'; // Hide
      detailsOpacity = 0;
    }

    const dirSign = this.isArabic ? -1 : 1;
    const finalTranslateX = translateX * dirSign - 50;
    const transform = `translateX(${finalTranslateX}%) scale(${scale})`;

    return {
      transform,
      'z-index': z,
      '--image-opacity': imageOpacity,
      visibility: slideVisibility,
      '--details-opacity': detailsOpacity,
      '--details-scale': detailsScale,
    };
  }

  private getTabletSlideStyle(i: number) {
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

  private getMobileSlideStyle(i: number) {
    const diff = i - this.currentIndex;

    const translateX = diff * 105 - 50;

    const dirSign = this.isArabic ? -1 : 1;
    const finalTranslateX = translateX * dirSign;
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
    const isRtl = this.isArabic;
    if (Math.abs(delta) > this.minSwipeDistance) {
      if (delta < 0) {
        if (!isRtl) this.navigateNext();
        else this.navigatePrev();
      } else {
        if (!isRtl) this.navigatePrev();
        else this.navigateNext();
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

  trackById(index: number, item: any): string {
    return item.category;
  }
}
