import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResponse } from '@core/interfaces/api-response';
import { WishlistResponse } from '@core/interfaces/wishlist-response';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private apiUrl = `${environment.apiUrl}`;
  private wishlistSubject = new BehaviorSubject<string[] | null>(null);
  wishlist$ = this.wishlistSubject.asObservable();

  private loaded = false;
  private loading = false;

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  initWishlist() {
    if (this.loaded || this.loading) return;
    this.loading = true;
    this.loadWishlist().subscribe({
      next: () => {
        this.loading = false;
        this.loaded = true;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  loadWishlist() {
    return this.http
      .get<ApiResponse<WishlistResponse>>(`${this.apiUrl}${environment.Wishlist.getWishlist}`)
      .pipe(
        map((res) => res.data?.items?.map((x) => x.serviceId) || []),
        tap((ids) => this.wishlistSubject.next(ids)),
        catchError((err) => {
          this.toast.error(this.translate.instant('WISHLIST.LOAD_ERROR'));
          console.error('Wishlist load error:', err);
          this.wishlistSubject.next([]);
          return of([]);
        })
      );
  }

  add(serviceId: string) {
    if (this.isInWishlist(serviceId)) {
      this.toast.success(this.translate.instant('WISHLIST.ALREADY_ADDED') || 'Already in wishlist');
      return of(false);
    }

    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}${environment.Wishlist.addToWishlist}`, { serviceId })
      .pipe(
        tap((res) => {
          if (res.succeeded) {
            const current = this.wishlistSubject.value ?? [];
            if (!current.includes(serviceId)) {
              this.wishlistSubject.next([...current, serviceId]);
            }
            this.toast.success(this.translate.instant('WISHLIST.ADDED') || 'Added to wishlist');
          } else {
            this.toast.error(res.message || this.translate.instant('WISHLIST.ADD_FAILED'));
          }
        }),
        map((res) => res.succeeded),
        catchError((err) => {
          this.toast.error(this.translate.instant('WISHLIST.ADD_ERROR') || 'Error while adding');
          console.error('Wishlist add error:', err);
          return of(false);
        })
      );
  }

  remove(serviceId: string) {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUrl}${environment.Wishlist.removeFromWishlist}`, {
        body: { serviceId },
      })
      .pipe(
        tap((res) => {
          if (res.succeeded) {
            const updated = (this.wishlistSubject.value ?? []).filter((id) => id !== serviceId);
            this.wishlistSubject.next(updated);
            this.toast.success(this.translate.instant('WISHLIST.REMOVED'));
          } else {
            this.toast.error(res.message || this.translate.instant('WISHLIST.REMOVE_FAILED'));
          }
        }),
        map(() => void 0),
        catchError((err) => {
          this.toast.error(this.translate.instant('WISHLIST.REMOVE_ERROR'));
          console.error('Wishlist remove error:', err);
          return throwError(() => err);
        })
      );
  }

  /** Check if a service is in the wishlist */
  isInWishlist(serviceId: string): boolean {
    return this.wishlistSubject.value?.includes(serviceId) ?? false;
  }
}
