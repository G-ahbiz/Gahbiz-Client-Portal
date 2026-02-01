import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Hero } from '@features/landingpage/components/hero/hero';
import { OurServices } from './components/our-services/our-services';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { BestOffers } from './components/best-offers/best-offers';
import { Testimonials } from './components/testimonials/testimonials';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-landingpage',
  imports: [Hero, OurServices, HowItWorks, BestOffers, Testimonials],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landingpage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  constructor(
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Defer translation initialization to after initial paint
    // Use requestIdleCallback or setTimeout to avoid blocking LCP
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(
        () => {
          this.initializeTranslation();
        },
        { timeout: 2000 },
      );
    } else {
      setTimeout(() => {
        this.initializeTranslation();
      }, 0);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTranslation() {
    // Get saved language (default to 'en' if not set)
    const savedLang = localStorage.getItem('servabest-language') || 'en';

    // Set default lang without triggering HTTP
    if (!this.translateService.defaultLang) {
      this.translateService.setDefaultLang(savedLang);
    }

    // Set direction immediately without waiting for translations
    document.documentElement.style.direction = savedLang === 'ar' ? 'rtl' : 'ltr';

    // Set initial language state
    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';

    // Mark for check once after initialization
    this.cdr.markForCheck();

    // Subscribe to language changes
    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: LangChangeEvent) => {
        this.isArabic = event.lang === 'ar';
        this.isEnglish = event.lang === 'en';
        this.isSpanish = event.lang === 'sp';

        // Trigger change detection for OnPush components
        this.cdr.markForCheck();
      });
  }
}
