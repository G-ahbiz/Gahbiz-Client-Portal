import { Component, OnInit } from '@angular/core';
import { Offer } from '@features/landingpage/components/best-offers/best-offers';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';

@Component({
  selector: 'app-related-services',
  imports: [Rating, TranslateModule],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss'
})
export class RelatedServices implements OnInit {

  offers: Offer[] = [];

  constructor() { }

  ngOnInit() {
    this.getOffers();
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
        stars: 4,
      },
      {
        id: 3,
        image: 'offer-1.png',
        description: 'Translate Certificate of birth',
        price: 100,
        discount: 10,
        stars: 4,
      }
    ];
  }

  putInFavorites(id: number) { }
  share(id: number) { }
}
