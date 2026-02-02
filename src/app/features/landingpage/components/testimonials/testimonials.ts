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
        nameKey: 'testimonials.review1.name',
        positionKey: 'testimonials.review1.position',
        image: 'testimonial.png',
        testimonialKey: 'testimonials.review1.text',
      },
      {
        id: 2,
        nameKey: 'testimonials.review2.name',
        positionKey: 'testimonials.review2.position',
        image: 'testimonial.png',
        testimonialKey: 'testimonials.review2.text',
      },
      {
        id: 3,
        nameKey: 'testimonials.review3.name',
        positionKey: 'testimonials.review3.position',
        image: 'testimonial.png',
        testimonialKey: 'testimonials.review3.text',
      },
    ];
  }
}
