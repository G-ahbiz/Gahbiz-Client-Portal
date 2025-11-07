import { Component, OnInit, ViewChild } from '@angular/core';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';
import { ServiceDetailsContent } from './service-details-content/service-details-content';
import { ServiceDetailsTabs } from './service-details-tabs/service-details-tabs';
import { RelatedServices } from './related-services/related-services';

@Component({
  selector: 'app-service-datails',
  standalone: true,
  imports: [
    Navbar,
    Footer,
    TranslateModule,
    ServiceDetailsContent,
    ServiceDetailsTabs,
    RelatedServices,
  ],
  templateUrl: './service-datails.html',
  styleUrl: './service-datails.scss',
})
export class ServiceDatails implements OnInit {
  @ViewChild(ServiceDetailsContent) serviceDetailsContent!: ServiceDetailsContent;

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  constructor(private translateService: TranslateService) {}

  ngOnInit() {
    this.initializeTranslation();
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

  /**
   * Handle review submitted event - refresh service details
   */
  onReviewSubmitted(): void {
    if (this.serviceDetailsContent) {
      this.serviceDetailsContent.refreshServiceDetails();
    }
  }
}
