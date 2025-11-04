import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { AllServicePageApiService } from './all-service-page-api.service';

@Injectable({
  providedIn: 'root',
})
export class AllServicePageFacadeService {
  private api = inject(AllServicePageApiService);

  // Cache for category filters (rarely changes)
  private categoryFiltersCache$?: Observable<any>;

  getCategories(page: number, size: number, includeServices: boolean, servicesPageSize: number) {
    return this.api
      .getCategories(page, size, includeServices, servicesPageSize)
      .pipe(catchError(this.handleError('getCategories')));
  }

  getServicesByCategory(id: string, page: number, size: number) {
    return this.api
      .getServicesByCategory(id, page, size)
      .pipe(catchError(this.handleError('getServicesByCategory')));
  }

  /**
   * Get category filters with caching
   */
  getCategoryFilters(): Observable<any> {
    if (!this.categoryFiltersCache$) {
      this.categoryFiltersCache$ = this.api.getCategories(1, 100, false, 0).pipe(
        shareReplay(1), // Cache the result
        catchError(this.handleError('getCategoryFilters'))
      );
    }
    return this.categoryFiltersCache$;
  }

  /**
   * Clear cache (useful for refresh scenarios)
   */
  clearCache(): void {
    this.categoryFiltersCache$ = undefined;
  }

  private handleError(operation: string) {
    return (error: any) => {
      console.error(`${operation} failed:`, error);
      // You could also send to logging service here
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}
