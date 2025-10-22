import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Carousel } from 'primeng/carousel';
import { Router } from '@angular/router';


@Component({
  selector: 'app-our-services',
  imports: [TranslateModule, FormsModule, CarouselModule, ButtonModule, TagModule],
  templateUrl: './our-services.html',
  styleUrl: './our-services.scss'
})
export class OurServices implements OnInit {
  constructor(private translateService: TranslateService, private router: Router) { }
  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  @ViewChild('carousel') carousel!: Carousel;
  services: any[] = [];
  responsiveOptions: any[] = [];
  scale: number = 0.5;

  ngOnInit() {
    this.initializeTranslation();
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

  navigateToAllServices() {
    this.router.navigate(['/all-services']);
  }
}
