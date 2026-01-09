import { Injectable } from '@angular/core';
import { BehaviorSubject, take, tap, catchError, of, Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { LandingApiService } from './landing-api.service';

@Injectable({
  providedIn: 'root',
})
export class LandingFacadeService {
  private categoriesSub = new BehaviorSubject<Category[]>([]);
  readonly categories$: Observable<Category[]> = this.categoriesSub.asObservable();

  constructor(private api: LandingApiService) {}

  /**
   * Load categories from API. If they already exist and force===false nothing happens.
   * Call with force=true to refresh.
   */
  loadCategories(force = false): void {
    if (!force && this.categoriesSub.value && this.categoriesSub.value.length) {
      return;
    }

    this.api
      .getAllCategories()
      .pipe(
        take(1),
        // This tap only runs on SUCCESS
        tap((cats) => this.categoriesSub.next(cats)),
        catchError((err) => {
          console.error('LandingFacade: failed to load categories', err);
          // FIX: Manually push the empty array to the subject on error
          this.categoriesSub.next([] as Category[]);
          return of([] as Category[]);
        })
      )
      .subscribe();
  }

  getCategoriesSnapshot(): Category[] {
    return this.categoriesSub.value;
  }
}
