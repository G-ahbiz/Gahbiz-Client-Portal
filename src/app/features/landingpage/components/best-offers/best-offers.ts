import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Offer } from '@features/landingpage/interfaces/offer';
import { LandingApiService } from '@features/landingpage/services/landing-api.service';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { ServiceDetails } from '@features/all-services/interfaces/all-services/service-details';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { CartItem } from '@features/cart/interfaces/cart-item';

@Component({
  selector: 'app-best-offers',
  imports: [TranslateModule, CommonModule, Rating],
  templateUrl: './best-offers.html',
  styleUrl: './best-offers.scss',
})
export class BestOffers implements OnInit {
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  offers$!: Observable<Offer[]>;
  isLoading: boolean = true;
  error: string = '';

  copiedOfferId: string | null = null;

  private translateService = inject(TranslateService);
  private landingApiService = inject(LandingApiService);
  private toastService = inject(ToastService);
  private cd = inject(ChangeDetectorRef);
  private cartFacadeService = inject(CartFacadeService);
  ngOnInit() {
    this.initializeTranslation();
    this.getOffers();
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

  getOffers() {
    this.isLoading = true;
    this.error = '';

    this.offers$ = this.landingApiService.getBestOffers().pipe(
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error) => {
        console.error('Error fetching best offers:', error);
        this.error = 'Failed to load best offers';
        this.isLoading = false;
        return of([]);
      })
    );
  }

  putInFavorites(id: string) {
    // Implement favorite functionality
    console.log('Add to favorites:', id);
  }

  onAddToCart(offer: Offer, event: Event): void {
    event.stopPropagation(); // Prevent card click when button is clicked
    const cartItem: any = {
      id: offer.id,
      name: offer.title,
      description: offer.title,
      price: offer.price,
      priceBefore: offer.priceBefore,
      rate: offer.rating,
      image: offer.imageUrl,
    };
    const result = this.cartFacadeService.addToCart(cartItem as CartItem);
    if (result) {
      this.toastService.success('Item added to cart', 3000);
    } else {
      this.toastService.error('Item already in cart', 3000);
    }
  }

  copyPageUrl(offerId: string) {
    if (!offerId || this.copiedOfferId === offerId) return;

    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/services/${offerId}`;

    // Use the modern Clipboard API
    navigator.clipboard.writeText(serviceUrl).then(
      () => {
        // Success
        this.copiedOfferId = offerId;
        this.cd.markForCheck();

        const message = this.translateService.instant('best-offers.toasts.url-copied');
        this.toastService.success(message || 'Service URL copied!');

        setTimeout(() => {
          this.copiedOfferId = null;
          this.cd.markForCheck();
        }, 2000);
      },
      (err) => {
        // Failure
        console.error('Failed to copy URL: ', err);
        const message = this.translateService.instant('best-offers.toasts.url-copy-failed');
        this.toastService.error(message || 'Failed to copy URL.');
      }
    );
  }
}
