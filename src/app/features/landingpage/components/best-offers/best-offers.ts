import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';

export interface Offer {
  id: number;
  image: string;
  description: string;
  price: number;
  discount: number;
  stars: number;
}

@Component({
  selector: 'app-best-offers',
  imports: [TranslateModule, CommonModule, Rating],
  templateUrl: './best-offers.html',
  styleUrl: './best-offers.scss'
})
export class BestOffers implements OnInit {
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  offers: Offer[] = [];

  constructor(private translateService: TranslateService) { }

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
    this.offers = [
      {
        id: 1,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 4,
      },
      {
        id: 2,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 1,
      },
      {
        id: 3,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 2,
      },
      {
        id: 4,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 3,
      },
      {
        id: 5,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 4,
      },
      {
        id: 6,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 5,
      }
    ];
  }

  putInFavorites(id: number) { }
  share(id: number) { }

}
