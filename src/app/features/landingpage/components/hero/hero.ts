import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [TranslateModule, CommonModule, RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  @Input() isArabic: boolean = false;
  @Input() isEnglish: boolean = false;
  @Input() isSpanish: boolean = false;

  private translate = inject(TranslateService);

  // Inline critical text for immediate LCP render
  readonly heroText = {
    title1: 'Find',
    title2: 'Trusted',
    title3: 'Professionals for Any Service – From Taxes to Home Needs',
    description: 'Fast, secure, and reliable bookings for individuals and businesses.',
    booknow: 'Book Now',
    exploreservices: 'Explore Services',
  };

  // Get text with instant fallback - CRITICAL: always return fallback first to avoid translation HTTP call blocking LCP
  getText(key: string, fallback: string): string {
    // Try to get translation instantly (if already loaded), otherwise use fallback
    const translation = this.translate.instant(key);
    // If translation key is returned unchanged, use fallback
    return translation !== key ? translation : fallback;
  }
}
