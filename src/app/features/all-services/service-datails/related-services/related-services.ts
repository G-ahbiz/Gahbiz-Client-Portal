import { Component, OnInit } from '@angular/core';
import { Offer } from '@features/landingpage/interfaces/offer';
import { TranslateModule } from '@ngx-translate/core';
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
        id: "1",
        imageUrl: 'offer-1.png',
        title: 'Translate Certificate of birth',
        price: 100,
        priceBefore: 10,
        rating: 4,
      },
      {
        id: "2",
        imageUrl: 'offer-1.png',
        title: 'Translate Certificate of birth',
        price: 100,
        priceBefore: 10,
        rating: 4,
      },
      {
        id: "3",
        imageUrl: 'offer-1.png',
        title: 'Translate Certificate of birth',
        price: 100,
        priceBefore: 10,
        rating: 4,
      }
    ];
  }

  putInFavorites(id: number) { }
  share(id: number) { }
}
