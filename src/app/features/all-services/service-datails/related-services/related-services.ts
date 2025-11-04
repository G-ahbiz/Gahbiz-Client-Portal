import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RelatedService } from '@features/all-services/interfaces/related-service';
import { AllServicePageFacadeService } from '@features/all-services/services/all-service/all-service-page-facade.service';
import { TranslateModule } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { BehaviorSubject, Observable, switchMap, of, map, catchError, startWith } from 'rxjs';

// 1. Define an interface for your view state
interface RelatedServicesState {
  services: RelatedService[];
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-related-services',
  standalone: true,
  imports: [Rating, TranslateModule, AsyncPipe, CommonModule],
  templateUrl: './related-services.html',
  styleUrl: './related-services.scss',
})
export class RelatedServices implements OnChanges {
  // --- Inputs ---
  @Input() categoryId: string | undefined;
  @Input() currentServiceId: string | undefined;

  // --- Injected Services ---
  private allServiceFacade = inject(AllServicePageFacadeService);
  private router = inject(Router);

  // --- State ---
  public copiedOfferId: string | null = null;

  // --- Observables ---
  private inputs$ = new BehaviorSubject<{ categoryId?: string; currentServiceId?: string }>({});

  public relatedServices$: Observable<RelatedServicesState> = this.inputs$.pipe(
    switchMap((inputs) => {
      const { categoryId, currentServiceId } = inputs;

      if (!categoryId) {
        return of({ services: [], isLoading: false, error: null });
      }

      const pageNumber = 1;
      const pageSize = 4;

      return this.allServiceFacade.getServicesByCategory(categoryId, pageNumber, pageSize).pipe(
        map((response) => {
          const allServices = (response?.data?.items || []) as RelatedService[];
          const filteredServices = allServices.filter((service) => service.id !== currentServiceId);

          return {
            services: filteredServices.slice(0, 3),
            isLoading: false,
            error: null,
          };
        }),
        catchError((err) => {
          console.error('Failed to fetch related services:', err);

          return of({
            services: [],
            isLoading: false,
            error: 'Failed to load related services. Please try again.',
          });
        }),
        startWith({ services: [], isLoading: true, error: null })
      );
    })
  );

  // --- Lifecycle Hooks ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['categoryId'] || changes['currentServiceId']) {
      this.inputs$.next({
        categoryId: this.categoryId,
        currentServiceId: this.currentServiceId,
      });
    }
  }

  // --- Public Methods ---
  openServiceDetails(id: string): void {
    this.router.navigate(['/service-details', id]);
  }

  putInFavorites(event: MouseEvent, id: string): void {
    event.stopPropagation();
    console.log('Add to favorites:', id);
    // TODO: Implement favorite logic
  }

  copyPageUrl(event: MouseEvent, id: string): void {
    event.stopPropagation();

    const url = `${window.location.origin}/all-services/${id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.copiedOfferId = id;
        setTimeout(() => {
          if (this.copiedOfferId === id) {
            this.copiedOfferId = null;
          }
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
      });
  }

  addToCart(event: MouseEvent, id: string): void {
    event.stopPropagation();
    console.log('Add to cart:', id);
    // TODO: Implement cart logic
  }
}
