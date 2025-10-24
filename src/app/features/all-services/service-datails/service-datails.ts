import { Component, OnInit } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { AllServicesComponentService, serviceDatailsInfo } from '@shared/services/all-services-component';
import { GalleriaModule } from 'primeng/galleria';
import { FormsModule } from '@angular/forms';
import { Rating } from '@shared/components/rating/rating';


@Component({
  selector: 'app-service-datails',
  imports: [Navbar, Footer, TranslateModule, Breadcrumb, GalleriaModule, FormsModule, Rating],
  templateUrl: './service-datails.html',
  styleUrl: './service-datails.scss'
})
export class ServiceDatails implements OnInit {

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // breadcrumb
  items: MenuItem[] = [{ label: 'Home', routerLink: '/home' }];
  home: MenuItem | undefined;

  // service details
  serviceDetails: serviceDatailsInfo[] = [];

  // service counter
  serviceCounter: number = 1;

  // service details images
  images: any[] = [
    {
      itemImageSrc: 'assets/images/all-services/ServiceDetails/1.jpg',
      thumbnailImageSrc: 'assets/images/all-services/ServiceDetails/1.jpg',
    },
    {
      itemImageSrc: 'assets/images/all-services/ServiceDetails/2.jpg',
      thumbnailImageSrc: 'assets/images/all-services/ServiceDetails/2.jpg',
    },
    {
      itemImageSrc: 'assets/images/all-services/ServiceDetails/3.jpg',
      thumbnailImageSrc: 'assets/images/all-services/ServiceDetails/3.jpg',
    },
    {
      itemImageSrc: 'assets/images/all-services/ServiceDetails/4.jpg',
      thumbnailImageSrc: 'assets/images/all-services/ServiceDetails/4.jpg',
    },
    {
      itemImageSrc: 'assets/images/all-services/ServiceDetails/5.jpg',
      thumbnailImageSrc: 'assets/images/all-services/ServiceDetails/5.jpg',
    }
  ];
  carouselPostition: any = 'bottom';

  position: 'left' | 'right' | 'top' | 'bottom' = this.carouselPostition = 'bottom';

  positionOptions = [
    {
      label: 'Bottom',
      value: 'bottom'
    },
    {
      label: 'Top',
      value: 'top'
    },
    {
      label: 'Left',
      value: 'left'
    },
    {
      label: 'Right',
      value: 'right'
    }
  ];

  responsiveOptions: any[] = [
    {
      breakpoint: '1300px',
      numVisible: 4,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
    },
  ];

  constructor(private translateService: TranslateService, private allServicesService: AllServicesComponentService) { }

  ngOnInit() {
    this.initializeTranslation();

    // service details
    this.getServiceDetails();

    // breadcrumb Home Icon
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    // update breadcrumb
    this.updateBreadcrumb();
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

  // update breadcrumb
  updateBreadcrumb() {
    this.items = [{ label: 'Our Services', routerLink: '/all-services' }];
    const activeServiceList = this.allServicesService.getActiveServiceList();
    const activeService = this.allServicesService.getActiveService();
    if (activeServiceList != 1) {
      let activeServiceTitle = this.isArabic ? this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceAr : this.isEnglish ? this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceEn : this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceSp;
      this.items?.push({ label: activeServiceTitle, routerLink: '' });
      this.items?.push({ label: this.isArabic ? this.serviceDetails[0].nameAr : this.isEnglish ? this.serviceDetails[0].nameEn : this.serviceDetails[0].nameSp, routerLink: '' });
    }
  }

  // get service details
  getServiceDetails() {
    this.serviceDetails = this.allServicesService.seviceDetails;
  }

  // increment service counter
  incrementServiceCounter() {
    if (this.serviceCounter >= 1) {
      this.serviceCounter++;
    }
  }

  // decrement service counter
  decrementServiceCounter() {
    if (this.serviceCounter > 1) {
      this.serviceCounter--;
    } else if (this.serviceCounter === 0) {
      this.serviceCounter = 1;
    }
  }
}
