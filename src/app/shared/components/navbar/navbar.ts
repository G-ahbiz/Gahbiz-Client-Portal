import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';

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
  constructor(private translateService: TranslateService, private router: Router) { }

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
}
