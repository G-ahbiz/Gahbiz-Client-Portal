import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-testimonials',
  imports: [TranslateModule, CommonModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials implements OnInit {
  @Input() isArabic: boolean = false;
  @Input() isEnglish: boolean = false;
  @Input() isSpanish: boolean = false;

  testimonials: any[] = [];

  ngOnInit() {
    this.getTestimonials();
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
      },
    ];
  }
}
