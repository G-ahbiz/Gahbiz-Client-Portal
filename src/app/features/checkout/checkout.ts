import { Component, OnInit } from '@angular/core';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { CartSummary } from '@features/cart/components/cart-summary/cart-summary';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AllServicesComponentService } from '@shared/services/all-services-component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [Navbar, Footer, CartSummary, TranslateModule, CommonModule, RouterModule],
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

  constructor(
    private translateService: TranslateService,
    private allServicesService: AllServicesComponentService
  ) {}

  ngOnInit() {
    this.initializeTranslation();
    this.getCartItems();
  }

  // Initialize translation
  private initializeTranslation() {
    // Set default language if not already set
    if (!localStorage.getItem('servabest-language')) {
      localStorage.setItem('servabest-language', 'en');
    }

    // Get saved language and set it
    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);
    if (savedLang === 'en' || savedLang === 'sp') {
      document.documentElement.style.direction = 'ltr';
    } else if (savedLang === 'ar') {
      document.documentElement.style.direction = 'rtl';
    }

    // Set initial language state
    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';
    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic = event.lang === 'ar';
      this.isEnglish = event.lang === 'en';
      this.isSpanish = event.lang === 'sp';
    });
  }

  // Get cart items
  private getCartItems() {
    this.cartItems = [
      {
        id: 1,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle:
          'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic',
      },
      {
        id: 2,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle:
          'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic',
      },
      {
        id: 3,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle:
          'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic',
      },
    ];
  }
}
