import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Offer } from '@features/landingpage/interfaces/offer';
import { LandingApiService } from '@features/landingpage/services/landing-api.service';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { Router } from '@angular/router';

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
  private router = inject(Router);

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

  openServiceDetails(id: string): void {
    this.router.navigate(['/service-details', id]);
  }

  putInFavorites(event: MouseEvent, id: string): void {
    event.stopPropagation();
    console.log('Add to favorites:', id);
    // TODO: Implement favorite logic
  }

  copyPageUrl(event: MouseEvent, offerId: string): void {
    event.stopPropagation();

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

  addToCart(event: MouseEvent, id: string): void {
    event.stopPropagation();
    console.log('Add to cart:', id);
    // TODO: Implement cart logic
  }
}
