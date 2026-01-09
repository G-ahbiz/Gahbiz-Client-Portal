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
        name: 'Fatima El-Sayed',
        position: 'Freelance Designer',
        image: 'testimonial.png',
        testimonial: `“Exceptional service! Servabest helped me streamline my finances and saved me so much time. Highly recommend for any business.”`,
      },
      {
        id: 2,
        name: 'Khaled Mansour',
        position: 'Startup Founder',
        image: 'testimonial.png',
        testimonial: `“The consultation I received was invaluable. The team at Servabest is proactive, detail-oriented, and truly cares about client success.”`,
      },
      {
        id: 3,
        name: 'Sara Mounir',
        position: 'Marketing Manager',
        image: 'testimonial.png',
        testimonial: `“Switching to Servabest was the best decision for our company's accounting. Everything is clear, timely, and perfectly managed.”`,
      }
    ];
  }
}
