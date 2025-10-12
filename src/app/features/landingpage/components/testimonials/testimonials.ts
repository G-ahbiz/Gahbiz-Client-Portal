import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-testimonials',
  imports: [TranslateModule, CommonModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss'
})
export class Testimonials implements OnInit {
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  testimonials: any[] = [];

  constructor(private translateService: TranslateService) { }

  ngOnInit() {
    this.initializeTranslation();
    this.getTestimonials();
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

  // Get testimonials
  private getTestimonials() {
    this.testimonials = [
      {
        id: 1,
        name: 'Ahmed Abdelawal',
        position: 'Business Owner',
        image: 'testimonial.png',
        testimonial: `“Servabest made my tax filing stress-free! Their team is professional and incredibly knowledgeable.”`,
      },
      {
        id: 2,
        name: 'Omar Ali',
        position: 'Software Engineer',
        image: 'testimonial.png',
        testimonial: `“Servabest made my tax filing stress-free! Their team is professional and incredibly knowledgeable.”`,
      },
      {
        id: 3,
        name: 'Ahmed Hassanien',
        position: 'Software Engineer',
        image: 'testimonial.png',
        testimonial: `“Servabest made my tax filing stress-free! Their team is professional and incredibly knowledgeable.”`,
      }
    ];
  }
}
