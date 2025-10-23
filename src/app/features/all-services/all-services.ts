import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { RatingModule } from 'primeng/rating';
import { ServicesComponent } from "./services-component/services-component";
import { AllServicesLists } from "./all-services-lists/all-services-lists";
import { AllServicesComponentService } from '@shared/services/all-services-component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';


export interface Service {
  id: number;
  serviceEn: string;
  serviceAr: string;
  serviceSp: string;
  active: boolean;
}

@Component({
  selector: 'app-all-services',
  imports: [TranslateModule, Navbar, Footer, Breadcrumb, RatingModule, ServicesComponent, AllServicesLists, CommonModule],
  templateUrl: './all-services.html',
  styleUrl: './all-services.scss'
})
export class AllServices implements OnInit, OnDestroy {
  private activeServiceSubscription?: Subscription;

  constructor(
    private translateService: TranslateService,
    private allServicesService: AllServicesComponentService
  ) { }

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // breadcrumb
  items: MenuItem[] = [{ label: 'Our Services', routerLink: '/all-services' }];
  home: MenuItem | undefined;

  // services list
  servicesTitles: Service[] | undefined;

  // active service
  activeService: number = 1;

  // all services list
  allServices: any[] | undefined;

  ngOnInit() {
    // initialize translation
    this.initializeTranslation();
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    // services titles list
    this.getServicesTitlesList();

    // Subscribe to active service changes from the shared service
    this.activeServiceSubscription = this.allServicesService.activeService$.subscribe(serviceId => {
      this.activeService = serviceId;
      this.updateBreadcrumb();
    });

    // get all services list
    this.getAllServicesList();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.activeServiceSubscription) {
      this.activeServiceSubscription.unsubscribe();
    }
    // Clear active service using the service
    this.allServicesService.clearActiveService();
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

  // set active service
  setActiveServiceList(serviceId: number) {
    // Use the shared service to set active service
    this.allServicesService.setActiveService(serviceId);
  }

  // update breadcrumb
  updateBreadcrumb() {
    this.items = [{ label: 'Our Services', routerLink: '/all-services' }];
    const activeService = this.allServicesService.getActiveService();
    if (activeService != 1) {
      let activeServiceTitle = this.isArabic ? this.servicesTitles?.find(service => service.id === activeService)?.serviceAr : this.isEnglish ? this.servicesTitles?.find(service => service.id === activeService)?.serviceEn : this.servicesTitles?.find(service => service.id === activeService)?.serviceSp;
      this.items?.push({ label: activeServiceTitle, routerLink: '' });
    }
  }

  // get all services list
  getAllServicesList() {
    this.allServices = [
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
        rating: 2,
        ratingsCount: 36,
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
        ratingsCount: 36,
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
        ratingsCount: 36,
        image: 'service.jpg',
        type: 'silver'
      },
    ]
  }

  getServicesTitlesList() {
    this.servicesTitles = [
      { id: 1, serviceEn: 'All Services', serviceAr: 'كل الخدمات', serviceSp: 'Todos los Servicios', active: true },
      { id: 2, serviceEn: 'Tax Services', serviceAr: 'خدمات الضرائب', serviceSp: 'Servicios de Impuestos', active: true },
      { id: 3, serviceEn: 'Public Services', serviceAr: 'خدمات العامة', serviceSp: 'Servicios Públicos', active: true },
      { id: 4, serviceEn: 'Immigration Services', serviceAr: 'خدمات الهجرة', serviceSp: 'Servicios de Inmigración', active: true },
      { id: 5, serviceEn: 'Food Vendor Services', serviceAr: 'خدمات المطاعم', serviceSp: 'Servicios de Vendedores de Alimentos', active: true },
      { id: 6, serviceEn: 'Business License Services', serviceAr: 'خدمات رخصة الأعمال', serviceSp: 'Servicios de Licencia Comercial', active: true },
      { id: 7, serviceEn: 'ITIN & EIN Services', serviceAr: 'خدمات ITIN & EIN', serviceSp: 'Servicios de ITIN & EIN', active: true },
      { id: 8, serviceEn: 'DMV Services', serviceAr: 'خدمات DMV', serviceSp: 'Servicios de DMV', active: true },
      { id: 9, serviceEn: 'Translation & Notary Public Services', serviceAr: 'خدمات الترجمة والعهد العام', serviceSp: 'Servicios de Traducción y Notario Público', active: true },
      { id: 10, serviceEn: 'Appointment Service', serviceAr: 'خدمات المواعيد', serviceSp: 'Servicios de Reservación', active: true },
    ];
  }
}
