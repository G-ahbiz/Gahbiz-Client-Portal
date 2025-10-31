import { Component, OnInit } from '@angular/core';
import { CartSummary } from "@features/cart/cart-summary/cart-summary";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-step1-checkout',
  imports: [CartSummary, CommonModule, TranslateModule],
  templateUrl: './step1-checkout.html',
  styleUrl: './step1-checkout.scss'
})
export class Step1Checkout implements OnInit {

  // Cart items
  cartItems: any[] = [];

  constructor() { }

  ngOnInit() {
    this.getCartItems();
  }

  private getCartItems() {
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
}
