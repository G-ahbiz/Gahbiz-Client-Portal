import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { ServicesComponent } from "../services-component/services-component";

@Component({
  selector: 'app-all-services-lists',
  imports: [TranslateModule, Rating, ServicesComponent],
  templateUrl: './all-services-lists.html',
  styleUrl: './all-services-lists.scss'
})
export class AllServicesLists implements OnInit {

  allservices: any[] | undefined;



  ngOnInit() {
    this.getAllServicesList();
  }

  // get all services list
  getAllServicesList() {

    this.allservices = [
      {
        id: 1,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 3,
        image: 'service.jpg',
        type: 'basic'
      },
      {
        id: 2,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 2,
        image: 'service.jpg',
        type: 'standard'
      },
      {
        id: 3,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 5,
        image: 'service.jpg',
        type: 'gold'
      },
      {
        id: 4,
        title: 'File Your Tax 1040 Single or MJS - Stander',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 4,
        image: 'service.jpg',
        type: 'silver'
      },
    ]

  }

}
