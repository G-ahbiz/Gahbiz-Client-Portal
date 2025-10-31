import { Component, Input, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { PaginatorModule } from 'primeng/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AllServicesComponentService } from '@shared/services/all-services-component';

@Component({
  selector: 'app-cart-cards',
  imports: [TranslateModule, Rating, PaginatorModule, MatIconModule, CommonModule],
  templateUrl: './cart-cards.html',
  styleUrl: './cart-cards.scss'
})
export class CartCards implements OnInit {

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // Pagination state
  currentPage: number = 1;
  pageSize: number = 2;
  totalPages: number[] = [];

  @Input() cartItems: any[] | undefined;


  constructor(private translateService: TranslateService, private router: Router, private allServicesService: AllServicesComponentService) { }

  ngOnInit() {
    this.initializeTranslation();
    this.updateTotalPages();
  }

  // navigate to service details
  removeFromCart(serviceId: number) {
    console.log('remove from cart', serviceId);
  }

  // save for later
  saveForLater(serviceId: number) {
    console.log('save for later', serviceId);
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
