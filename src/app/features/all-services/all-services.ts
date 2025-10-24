import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { RatingModule } from 'primeng/rating';
import { ServicesComponent } from "./services-component/services-component";
import { AllServicesLists } from "./all-services-lists/all-services-lists";
import { AllServicesComponentService, AllServicesDetails, ServicesListTitles } from '@shared/services/all-services-component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AllServicesTabs } from "./all-services-tabs/all-services-tabs";




@Component({
  selector: 'app-all-services',
  imports: [TranslateModule, Navbar, Footer, Breadcrumb, RatingModule, ServicesComponent, AllServicesLists, CommonModule, AllServicesTabs],
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
  items: MenuItem[] = [{ label: 'Home', routerLink: '/all-services' }];
  home: MenuItem | undefined;

  // services list
  servicesListTitles: ServicesListTitles[] = [];

  // active service
  activeService: number = 1;

  // all services list
  allServices: AllServicesDetails[] = [];

  ngOnInit() {
    // initialize translation
    this.initializeTranslation();
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    // services titles list
    this.getServicesTitlesList();

    // Subscribe to active service changes from the shared service
    this.activeServiceSubscription = this.allServicesService.activeServiceList$.subscribe((serviceId: number) => {
      this.activeService = serviceId;
      this.updateBreadcrumb();
    });

    // get all services list
    this.getAllServicesList();
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    // if (this.activeServiceSubscription) {
    //   this.activeServiceSubscription.unsubscribe();
    // }
    // Clear active service using the service
    // this.allServicesService.clearActiveServiceList();
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
    this.allServicesService.setActiveServiceList(serviceId);
  }

  // update breadcrumb
  updateBreadcrumb() {
    this.items = [{ label: 'Our Services', routerLink: '/all-services' }];
    const activeServiceList = this.allServicesService.getActiveServiceList();
    if (activeServiceList != 1) {
      let activeServiceTitle = this.isArabic ? this.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceAr : this.isEnglish ? this.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceEn : this.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceSp;
      this.items?.push({ label: activeServiceTitle, routerLink: '' });
    }
  }

  // get all services list
  getAllServicesList() {
    this.allServices = this.allServicesService.allServices;
  }

  // get services titles list
  getServicesTitlesList() {
    this.servicesListTitles = this.allServicesService.servicesListTitles;
  }
}
