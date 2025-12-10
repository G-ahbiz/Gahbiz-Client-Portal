import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { AllServicePageFacadeService } from '@features/all-services/services/all-service/all-service-page-facade.service';

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit, OnDestroy {
  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // services list
  services: any | undefined;

  isLoggedIn$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  cartItemCount = 0;
  private cartSub?: Subscription;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private authService: AuthService,
    private allServicePageFacade: AllServicePageFacadeService,
    private cartFacade: CartFacadeService
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.initializeTranslation();

    this.cartSub = this.cartFacade.cart$.subscribe((cart) => {
      this.cartItemCount = cart.length;
    });

    this.loadCategories();
  }

  loadCategories() {
    this.allServicePageFacade
      .getCategories(1, 100000, false, 0) // page=1, size=100000, includeServices=false
      .subscribe((res) => {
        if (res?.data?.items) {
          console.log(res.data.items);
          this.services = res.data.items;
        }
      });
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

  // Change language
  changeLanguage(lang: string) {
    if (lang === 'en') {
      localStorage.setItem('servabest-language', 'en');
      this.isArabic = false;
      this.isEnglish = true;
      this.isSpanish = false;
    } else if (lang === 'ar') {
      localStorage.setItem('servabest-language', 'ar');
      this.isArabic = true;
      this.isEnglish = false;
      this.isSpanish = false;
    } else if (lang === 'sp') {
      localStorage.setItem('servabest-language', 'sp');
      this.isArabic = false;
      this.isEnglish = false;
      this.isSpanish = true;
    }
    this.initializeTranslation();
  }
  
  navigateToCategory(categoryId: string) {
    if (!categoryId) return;

    this.closeOffcanvasAndRestoreScroll();

    this.router.navigate(['/all-services'], {
      queryParams: { categoryId: categoryId },
    });
  }

  closeOffcanvasAndRestoreScroll() {
    // Close the offcanvas
    const offcanvas = document.getElementById('offcanvasNavbar');
    if (offcanvas) {
      const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvas);
      if (bsOffcanvas) {
        bsOffcanvas.hide();
      }
    }

    // Restore body scroll and remove backdrop
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // Remove Bootstrap backdrop if it exists
      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }, 150);
  }

  // Unified navigation method for all links
  navigateTo(route: string) {
    this.closeOffcanvasAndRestoreScroll();
    setTimeout(() => {
      this.router.navigate([route]);
    }, 200);
  }

  // Handle dropdown navigation
  navigateWithDropdown(route: string) {
    this.closeOffcanvasAndRestoreScroll();

    // Close any open dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove('show');
    });

    setTimeout(() => {
      this.router.navigate([route]);
    }, 200);
  }

  // Logout method
  logout() {
    this.closeOffcanvasAndRestoreScroll();
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/auth/sign-in']);
    }, 200);
  }

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }
}
