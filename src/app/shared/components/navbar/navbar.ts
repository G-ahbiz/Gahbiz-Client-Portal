import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AllServicesComponentService } from '@shared/services/all-services-component';

export interface Service {
  id: number;
  serviceEn: string;
  serviceAr: string;
  serviceSp: string;
  active: boolean;
}

@Component({
  selector: 'app-navbar',
  imports: [TranslateModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // services list
  services: Service[] | undefined;

  constructor(
    private translateService: TranslateService,
    private router: Router,
    private allServicesService: AllServicesComponentService
  ) { }

  ngOnInit() {
    this.initializeTranslation();
    // services list
    this.services = [
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

  // Change language
  changeLanguage(lang: string) {
    if (lang === 'en') {
      localStorage.setItem('servabest-language', 'en');
      this.isArabic = false;
      this.isEnglish = true;
      this.isSpanish = false;
    } else if (lang === 'ar') {
      localStorage.setItem('servabest-language', 'ar');
      this.isArabic = true;
      this.isEnglish = false;
      this.isSpanish = false;
    } else if (lang === 'sp') {
      localStorage.setItem('servabest-language', 'sp');
      this.isArabic = false;
      this.isEnglish = false;
      this.isSpanish = true;
    }
    this.initializeTranslation();
  }

  // set active service
  setActiveServiceList(serviceId: number) {
    // Use the shared service to set active service
    this.allServicesService.setActiveService(serviceId);
    this.router.navigate(['/all-services']);
  }
}
