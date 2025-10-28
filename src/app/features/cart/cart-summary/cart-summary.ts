import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-summary',
  imports: [TranslateModule, CommonModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.scss'
})
export class CartSummary implements OnInit {

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  @Input() cartItems: any[] | undefined;
  totalPrice: number = 0;

  isProfileComplete: boolean = false;

  constructor(private translateService: TranslateService, private router: Router) { }

  ngOnInit() {
    this.initializeTranslation();
    this.calculateTotalPrice();
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

  // Calculate total price
  private calculateTotalPrice() {
    this.totalPrice = this.cartItems?.reduce((total, cartItem) => total + parseFloat(cartItem.priceOffer), 0) || 0;
  }

  // navigate to complete profile
  navigateToCompleteProfile() {
    window.location.href = '/complete-profile';
  }

  // Proceed to checkout
  proceedToCheckout() {
    this.router.navigate(['/checkout']);
  }
}
