import { Injectable, computed, inject, signal } from '@angular/core';
import { ServicesDetailsApiService } from './services-details-api.service';
import { ServicesDetailsResponse } from '@features/all-services/interfaces/services-details/services-details-response';
import { RequiredFilesResponse } from '@features/all-services/interfaces/services-details/required-files/required-files-response';
import {
  GetReviewsParams,
  DEFAULT_REVIEWS_PARAMS,
} from '@features/all-services/interfaces/services-details/reviews-tab/get-reviews-params';
import {
  ReviewData,
  createEmptyReviewData,
} from '@features/all-services/interfaces/services-details/reviews-tab/review-data';
import {
  CreateReviewRequest,
  isValidCreateReviewRequest,
} from '@features/all-services/interfaces/services-details/reviews-tab/create-review-request';
import { throwError, Observable, of } from 'rxjs';
import { catchError, map, tap, switchMap, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';

interface ReviewsState {
  data: ReviewData;
  isLoading: boolean;
  error: string | null;
  lastParams: GetReviewsParams | null;
}

@Injectable({
  providedIn: 'root',
})
export class ServicesDetailsFacadeService {
  private apiService = inject(ServicesDetailsApiService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  // --- STATE ---
  private state = signal<ReviewsState>({
    data: createEmptyReviewData(),
    isLoading: false,
    error: null,
    lastParams: null,
  });

  // --- SELECTORS ---
  data = computed(() => this.state().data);
  isLoading = computed(() => this.state().isLoading);
  error = computed(() => this.state().error);
  lastParams = computed(() => this.state().lastParams);

  averageRating = computed(() => this.state().data.rating);
  totalReviews = computed(() => this.state().data.ratingCount);

  ratingDistribution = computed(() => {
    const distribution = this.state().data.ratingDistribution?.slice()?.reverse() ?? [
      0, 0, 0, 0, 0,
    ];
    // Ensure we always have exactly 5 elements
    return distribution.length === 5 ? distribution : [0, 0, 0, 0, 0];
  });

  reviewsList = computed(() => this.state().data.reviews.items);
  pagination = computed(() => this.state().data.reviews);

  // --- API wrappers ---
  getServiceDetails(serviceId: string): Observable<ServicesDetailsResponse> {
    return this.apiService.getServiceById(serviceId);
  }

  getRequiredFiles(serviceId: string): Observable<RequiredFilesResponse> {
    return this.apiService.getRequiredFiles(serviceId);
  }

  /**
   * Load reviews and update local state
   */
  loadReviews(serviceId: string, params: GetReviewsParams): Observable<void> {
    if (!serviceId?.trim()) {
      const error = 'Invalid service ID';
      this.state.update((s) => ({ ...s, isLoading: false, error }));
      return throwError(() => new Error(error));
    }

    this.state.update((s) => ({ ...s, isLoading: true, error: null }));

    return this.apiService.getReviews(serviceId, params).pipe(
      tap((data) => {
        console.debug('[Reviews] API response:', data);

        this.state.update((s) => ({
          ...s,
          isLoading: false,
          data: this.mergeReviewData(s.data, data, params.pageNumber),
          lastParams: params,
        }));
      }),
      map(() => void 0),
      catchError((err) => {
        console.error('Failed to load reviews', err);

        let translatedError =
          this.translate.instant('REVIEWS.ERROR_LOAD') || 'Failed to load reviews.';

        // More specific error messages based on error type
        switch (err.message) {
          case 'NETWORK_ERROR':
            translatedError =
              this.translate.instant('REVIEWS.ERROR_NETWORK') ||
              'Network error. Please check your connection.';
            break;
          case 'CLIENT_ERROR':
            translatedError =
              this.translate.instant('REVIEWS.ERROR_CLIENT') ||
              'Invalid request. Please try again.';
            break;
          case 'SERVER_ERROR':
            translatedError =
              this.translate.instant('REVIEWS.ERROR_SERVER') ||
              'Server error. Please try again later.';
            break;
        }

        this.state.update((s) => ({
          ...s,
          isLoading: false,
          error: translatedError,
        }));

        this.toast.error(translatedError);
        return throwError(() => err);
      }),
      finalize(() => {
        this.state.update((s) => ({ ...s, isLoading: false }));
      })
    );
  }

  /**
   * Post a review with validation and error handling
   */
  postReview(review: CreateReviewRequest): Observable<void> {
    if (!isValidCreateReviewRequest(review)) {
      const error = this.translate.instant('REVIEWS.INVALID_DATA') || 'Invalid review data.';
      this.toast.error(error);
      return throwError(() => new Error('INVALID_REVIEW_DATA'));
    }

    this.state.update((s) => ({ ...s, isLoading: true, error: null }));

    return this.apiService.createReview(review).pipe(
      switchMap(() => {
        const reloadParams = this.state().lastParams || DEFAULT_REVIEWS_PARAMS;
        return this.loadReviews(review.serviceId, { ...reloadParams, pageNumber: 1 });
      }),
      tap(() => {
        const msg =
          this.translate.instant('REVIEWS.SUBMIT_SUCCESS') || 'Thank you for your review!';
        this.toast.success(msg);
      }),
      map(() => void 0),
      catchError((err) => {
        console.error('Failed to post review', err);

        let errorMsg =
          this.translate.instant('REVIEWS.SUBMIT_FAILED') ||
          'Failed to submit review. Please try again.';

        if (err.status === 409 || err.originalError?.statusCode === 'Conflict') {
          errorMsg =
            this.translate.instant('REVIEWS.ALREADY_REVIEWED') ||
            'You have already submitted a review for this service. Thank you for your feedback!';
        } else if (err.message === 'NETWORK_ERROR') {
          errorMsg =
            this.translate.instant('REVIEWS.ERROR_NETWORK') ||
            'Network error. Please check your connection.';
        } else if (err.message === 'INVALID_REVIEW_DATA') {
          errorMsg =
            this.translate.instant('REVIEWS.INVALID_DATA') ||
            'Invalid review data. Please check your inputs.';
        }

        this.toast.error(errorMsg);
        return throwError(() => err);
      }),
      finalize(() => {
        this.state.update((s) => ({ ...s, isLoading: false }));
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.state.update((s) => ({ ...s, error: null }));
  }

  /**
   * Reset state to initial values
   */
  resetState(): void {
    this.state.set({
      data: createEmptyReviewData(),
      isLoading: false,
      error: null,
      lastParams: null,
    });
  }

  /**
   * Enhanced merge helper for pagination with better defensive programming
   */
  private mergeReviewData(
    existing: ReviewData,
    incoming: ReviewData,
    pageNumber: number = 1
  ): ReviewData {
    // Normalize incoming data
    const normalizedIncoming: ReviewData = {
      rating: incoming?.rating ?? 0,
      ratingCount: incoming?.ratingCount ?? 0,
      ratingDistribution:
        Array.isArray(incoming?.ratingDistribution) && incoming.ratingDistribution.length === 5
          ? incoming.ratingDistribution
          : [0, 0, 0, 0, 0],
      reviews: {
        items: Array.isArray(incoming?.reviews?.items) ? incoming.reviews.items : [],
        pageNumber: incoming?.reviews?.pageNumber ?? pageNumber,
        totalCount: incoming?.reviews?.totalCount ?? 0,
        totalPages: incoming?.reviews?.totalPages ?? 0,
        hasPreviousPage: incoming?.reviews?.hasPreviousPage ?? false,
        hasNextPage: incoming?.reviews?.hasNextPage ?? false,
      },
    };

    // If loading page 1 or no existing data, return incoming
    if (pageNumber === 1 || !existing?.reviews?.items?.length) {
      return normalizedIncoming;
    }

    // For subsequent pages, append items
    if (pageNumber > 1 && existing.reviews.items.length > 0) {
      return {
        ...normalizedIncoming,
        reviews: {
          ...normalizedIncoming.reviews,
          items: [...existing.reviews.items, ...normalizedIncoming.reviews.items],
        },
      };
    }

    return normalizedIncoming;
  }
}
