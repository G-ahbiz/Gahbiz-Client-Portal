import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-checkout',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // Cart items
  cartItems: any[] = [];

  activeStep: number = 1;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initializeTranslation();
    this.trackStepFromRoute();
  }

  private initializeTranslation() {
    if (!localStorage.getItem('servabest-language')) {
      localStorage.setItem('servabest-language', 'en');
    }

    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);
    document.documentElement.style.direction = savedLang === 'ar' ? 'rtl' : 'ltr';

    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';

    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic = event.lang === 'ar';
      this.isEnglish = event.lang === 'en';
      this.isSpanish = event.lang === 'sp';
    });
  }

  setStep(step: number) {
    this.activeStep = step;
    this.router.navigate(['/checkout/step' + step]);
  }

  private trackStepFromRoute() {
    // Set step on initial load
    this.updateStepFromUrl(this.router.url);

    this.scrollToTop();

    // Update step on navigation
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updateStepFromUrl(this.router.url);
      this.scrollToTop();
    });
  }

  private scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  private updateStepFromUrl(url: string) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('/checkout/step1')) this.activeStep = 1;
    else if (lowerUrl.includes('/checkout/step2')) this.activeStep = 2;
    else if (lowerUrl.includes('/checkout/step3')) this.activeStep = 3;
    else this.activeStep = 1;
  }
}
