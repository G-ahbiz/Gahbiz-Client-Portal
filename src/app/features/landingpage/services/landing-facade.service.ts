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

  private readonly CACHE_KEY = 'servabest_categories_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

  constructor(private api: LandingApiService) {
    // Try to load from cache immediately on service initialization
    this.loadFromCache();
  }

  /**
   * Load categories from API. If they already exist and force===false nothing happens.
   * Call with force=true to refresh.
   */
  loadCategories(force = false): void {
    if (!force && this.categoriesSub.value && this.categoriesSub.value.length) {
      return;
    }

    // If not forcing, try cache first
    if (!force && this.loadFromCache()) {
      return;
    }

    this.api
      .getAllCategories()
      .pipe(
        take(1),
        tap((cats) => {
          this.categoriesSub.next(cats);
          this.saveToCache(cats);
        }),
        catchError((err) => {
          console.error('LandingFacade: failed to load categories', err);
          // Try to use stale cache as fallback
          const cached = this.loadFromCache(true);
          if (!cached) {
            this.categoriesSub.next([] as Category[]);
          }
          return of([] as Category[]);
        }),
      )
      .subscribe();
  }

  /**
   * Load categories from localStorage cache
   * @param ignoreExpiry - If true, loads even expired cache
   * @returns true if cache was loaded successfully
   */
  private loadFromCache(ignoreExpiry = false): boolean {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return false;

      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_DURATION;

      if (!ignoreExpiry && isExpired) {
        return false;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        this.categoriesSub.next(data);
        return true;
      }
    } catch (error) {
      console.warn('Failed to load categories from cache:', error);
    }
    return false;
  }

  /**
   * Save categories to localStorage cache
   */
  private saveToCache(categories: Category[]): void {
    try {
      const cacheData = {
        data: categories,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save categories to cache:', error);
    }
  }

  getCategoriesSnapshot(): Category[] {
    return this.categoriesSub.value;
  }
}
