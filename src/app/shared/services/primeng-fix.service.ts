import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PrimengFixService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Fix for PrimeNG components that don't render properly when initially hidden
   */
  fixPrimeNGComponents(container?: HTMLElement): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      // Trigger multiple resize events to force PrimeNG to recalculate
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, i * 100);
      }

      // Force reflow on PrimeNG components
      this.forcePrimeNGReflow(container);
    }, 150);
  }

  /**
   * Force PrimeNG components to reflow by temporarily modifying them
   */
  private forcePrimeNGReflow(container?: HTMLElement): void {
    const target = container || document.body;

    // Find all PrimeNG rating components
    const ratings = target.querySelectorAll('p-rating');
    ratings.forEach((rating: Element) => {
      const htmlRating = rating as HTMLElement;
      const originalDisplay = htmlRating.style.display;

      // Force reflow
      htmlRating.style.display = 'none';
      void htmlRating.offsetHeight; // Trigger reflow
      htmlRating.style.display = originalDisplay || '';
    });

    // Find all PrimeNG icons
    const icons = target.querySelectorAll('.p-rating-icon');
    icons.forEach((icon: Element) => {
      const htmlIcon = icon as HTMLElement;
      htmlIcon.style.transform = 'scale(1)';
    });
  }

  /**
   * Specifically fix rating components
   */
  fixRatingComponents(container?: HTMLElement): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      const target = container || document.body;
      const ratings = target.querySelectorAll('p-rating');

      ratings.forEach((rating: Element) => {
        const component = rating as any;
        // Trigger Angular change detection on the component
        if (component.ngOnChanges) {
          component.ngOnChanges({});
        }
      });

      this.fixPrimeNGComponents(container);
    }, 100);
  }
}
