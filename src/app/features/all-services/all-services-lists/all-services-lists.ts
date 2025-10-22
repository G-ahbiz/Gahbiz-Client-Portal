import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesComponent } from "../services-component/services-component";

@Component({
  selector: 'app-all-services-lists',
  imports: [TranslateModule, ServicesComponent],
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
      {
        id: 5,
        title: 'the fifth service',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '45',
        orignalPrice: '52',
        rating: 3,
        image: 'service.jpg',
        type: 'basic'
      },
      {
        id: 6,
        title: 'the sixth service',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '95',
        orignalPrice: '110',
        rating: 2,
        image: 'service.jpg',
        type: 'standard'
      },
      {
        id: 7,
        title: 'the seventh service',
        subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
        priceOffer: '85',
        orignalPrice: '102',
        rating: 5,
        image: 'service.jpg',
        type: 'gold'
      },
      {
        id: 8,
        title: 'the eighth service',
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
