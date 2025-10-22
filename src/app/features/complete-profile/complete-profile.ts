import { Component, OnInit } from '@angular/core';
import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import { FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-complete-profile',
  imports: [TranslateModule, Navbar, Footer, CommonModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss'
})
export class CompleteProfile implements OnInit {

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // phone code
  currentPhoneCode = '+1';
  phoneCodes = [
    { code: '+1', name: 'United States', flag: 'usa', image: 'assets/images/navbar/language-icons/america.svg' },
    { code: '+20', name: 'Egypt', flag: 'eg', image: 'assets/images/navbar/language-icons/egypt.svg' },
    { code: '+34', name: 'Spain', flag: 'sp', image: 'assets/images/navbar/language-icons/spain.svg' }
  ];

  // form
  completeProfileForm: FormGroup = new FormGroup({
    fullLegalName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    gender: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    nationalId: new FormControl('', [Validators.required]),
    birthMonth: new FormControl('', [Validators.required]),
    birthDay: new FormControl('', [Validators.required]),
    birthYear: new FormControl('', [Validators.required]),
    country: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    postalCode: new FormControl('', [Validators.required]),
  });

  constructor(private translateService: TranslateService) { }

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

  setCurrentPhoneCode(country: string) {
    if (country === 'usa') {
      this.currentPhoneCode = '+1';
    } else if (country === 'eg') {
      this.currentPhoneCode = '+20';
    } else if (country === 'sp') {
      this.currentPhoneCode = '+34';
    } else {
      this.currentPhoneCode = '+1';
    }
  }

}
