import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Offer } from '@features/landingpage/interfaces/offer';
import { LandingApiService } from '@features/landingpage/services/landing-api.service';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';

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

  offers: Offer[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private translateService: TranslateService,
    private landingApiService: LandingApiService
  ) {}

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

    this.landingApiService.getBestOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching best offers:', error);
        this.error = 'Failed to load best offers';
        this.isLoading = false;
      },
    });
  }

  putInFavorites(id: string) {
    // Implement favorite functionality
    console.log('Add to favorites:', id);
  }

  share(id: string) {
    // Implement share functionality
    console.log('Share offer:', id);
  }
}
