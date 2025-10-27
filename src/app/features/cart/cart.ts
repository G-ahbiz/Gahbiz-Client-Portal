import { Component, Input, OnInit } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { EmptyCart } from "./empty-cart/empty-cart";
import { AllServicesComponentService } from '@shared/services/all-services-component';
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Rating } from '@shared/components/rating/rating';
import { ServicesComponent } from "@features/all-services/services-component/services-component";
import { CartCards } from "./cart-cards/cart-cards";
import { CartSummary } from "./cart-summary/cart-summary";

@Component({
  selector: 'app-cart',
  imports: [Navbar, Footer, EmptyCart, TranslateModule, CommonModule, Rating, ServicesComponent, CartCards, CartSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.scss'
})
export class Cart implements OnInit {

  // Cart items
  cartItems: any[] = [];

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 4;
  totalPages: number[] = [];

  constructor(private translateService: TranslateService, private router: Router, private allServicesService: AllServicesComponentService) { }

  ngOnInit() {
    this.initializeTranslation();
    this.updateTotalPages();

    this.cartItems = [
      {
        id: 1,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic'
      },
      {
        id: 2,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic'
      },
      {
        id: 3,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'basic'
      },
    ]
  }

  // navigate to service details
  navigateToServiceDetails(serviceId: number) {
    this.allServicesService.setActiveService(serviceId);
    this.router.navigate(['/service-details']);
  }

  // add to cart
  addToCart(serviceId: number) {
    this.allServicesService.setActiveService(serviceId);
    this.allServicesService.addToCart(serviceId);
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

  // get total pages
  getTotalPages() {
    if (!this.cartItems || this.cartItems.length === 0) return 0;
    return Math.ceil(this.cartItems.length / this.pageSize);
  }
  // get current page
  getCurrentPage() {
    return this.currentPage;
  }
  // get page size
  getPageSize() {
    return this.pageSize;
  }

  // get paginated cart items for current page
  getPaginatedCartItems() {
    if (!this.cartItems || this.cartItems.length === 0) return [];

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.cartItems.slice(startIndex, endIndex);
  }

  // update total pages array
  private updateTotalPages() {
    const totalPages = this.getTotalPages();
    this.totalPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // on page change with validation
  onPageChange(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // on previous page with validation
  onPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // on next page with validation
  onNextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // on page size change
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateTotalPages();
  }
}
