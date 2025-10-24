import { Component, Input, OnInit } from '@angular/core';
import { ServicesTitles, AllServicesComponentService } from '@shared/services/all-services-component';
import { TranslateService, LangChangeEvent, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-all-services-tabs',
  imports: [TranslateModule],
  templateUrl: './all-services-tabs.html',
  styleUrl: './all-services-tabs.scss'
})
export class AllServicesTabs implements OnInit {
  @Input() servicesTitles: ServicesTitles[] = [];
  // active service
  @Input() activeService: number = 1;

  // language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  constructor(
    private translateService: TranslateService,
    private allServicesService: AllServicesComponentService
  ) { }

  ngOnInit() {
    // initialize translation
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

  // set active service
  setActiveServiceList(serviceId: number) {
    // Use the shared service to set active service
    this.allServicesService.setActiveServiceList(serviceId);
  }
}
