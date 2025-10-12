import { Component, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Carousel } from 'primeng/carousel';


@Component({
  selector: 'app-our-services',
  imports: [TranslateModule, FormsModule, CarouselModule, ButtonModule, TagModule],
  templateUrl: './our-services.html',
  styleUrl: './our-services.scss'
})
export class OurServices {

  @ViewChild('carousel') carousel!: Carousel;
  services: any[] = [];
  responsiveOptions: any[] = [];
  scale: number = 0.5;

  ngOnInit() {

    this.services = [
      {
        title: 'DMV',
        caption: 'Assistance with driving licenses, vehicle registration, and services.',
        serviceCount: 8,
        image: 'dmv.png',
        category: 'Government'
      },
      {
        title: 'Tax Services',
        caption: 'Professional tax filing, preparation, and advisory services.',
        serviceCount: 16,
        image: 'tax.png',
        category: 'Financial'
      },
      {
        title: 'Immigration',
        caption: 'Assistance with immigration processes and legal documentation.',
        serviceCount: 12,
        image: 'Immigration.png',
        category: 'Legal'
      },
      {
        title: 'DMV',
        caption: 'Assistance with driving licenses, vehicle registration, and services.',
        serviceCount: 8,
        image: 'dmv.png',
        category: 'Government'
      },
      {
        title: 'Tax Services',
        caption: 'Professional tax filing, preparation, and advisory services.',
        serviceCount: 16,
        image: 'tax.png',
        category: 'Financial'
      },
      {
        title: 'Immigration',
        caption: 'Assistance with immigration processes and legal documentation.',
        serviceCount: 12,
        image: 'Immigration.png',
        category: 'Legal'
      }
    ];

    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '1199px',
        numVisible: 3,
        numScroll: 1
      },
      {
        breakpoint: '992px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '576px',
        numVisible: 1,
        numScroll: 1
      },
      {
        breakpoint: '420px',
        numVisible: 1,
        numScroll: 1
      }
    ]
  }

  // scale slide if slide in the middle of the screen
  onResize(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollLeft > target.scrollWidth / 2) {
      this.scale = 0.5;
    } else {
      this.scale = 1;
    }
  }

  onServiceClick(service: string) {
    console.log(service);
  }

  navigateNext() {
    this.carousel.navForward(new MouseEvent('click'));
  }

  navigatePrev() {
    this.carousel.navBackward(new MouseEvent('click'));
  }
}
