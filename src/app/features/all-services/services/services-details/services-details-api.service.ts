import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import {
  CreateReviewRequest,
  isValidCreateReviewRequest,
} from '@features/all-services/interfaces/services-details/reviews-tab/create-review-request';
import {
  GetReviewsParams,
  sanitizeReviewsParams,
} from '@features/all-services/interfaces/services-details/reviews-tab/get-reviews-params';
import { RequiredFilesResponse } from '@features/all-services/interfaces/services-details/required-files/required-files-response';
import {
  ReviewData,
  createEmptyReviewData,
} from '@features/all-services/interfaces/services-details/reviews-tab/review-data';
import { Review } from '@features/all-services/interfaces/services-details/reviews-tab/reviews';
import { ServicesDetailsResponse } from '@features/all-services/interfaces/services-details/services-details-response';
import { Observable, throwError } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ServicesDetailsApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`;
  private readonly API_TIMEOUT = 30000; // 30 seconds

  private handleError(error: HttpErrorResponse, context: string) {
    console.error(`API Error in ${context}:`, error);

    if (error.status === 0) {
      // Network error
      return throwError(() => new Error('NETWORK_ERROR'));
    } else if (error.status >= 400 && error.status < 500) {
      // Client error
      return throwError(() => new Error('CLIENT_ERROR'));
    } else {
      // Server error
      return throwError(() => new Error('SERVER_ERROR'));
    }
  }

  getServiceById(serviceId: string): Observable<ServicesDetailsResponse> {
    if (!serviceId?.trim()) {
      return throwError(() => new Error('INVALID_SERVICE_ID'));
    }

    return this.http
      .get<ApiResponse<ServicesDetailsResponse>>(
        `${this.apiUrl}${environment.services.getServiceById}${serviceId}`
      )
      .pipe(
        timeout(this.API_TIMEOUT),
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'getServiceById'))
      );
  }

  getRequiredFiles(serviceId: string): Observable<RequiredFilesResponse> {
    if (!serviceId?.trim()) {
      return throwError(() => new Error('INVALID_SERVICE_ID'));
    }

    return this.http
      .get<ApiResponse<RequiredFilesResponse>>(
        `${this.apiUrl}${environment.serviceSubmissions.getRequiredFiles}${serviceId}/required-files`
      )
      .pipe(
        timeout(this.API_TIMEOUT),
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'getRequiredFiles'))
      );
  }

  getReviews(serviceId: string, params: GetReviewsParams): Observable<ReviewData> {
    if (!serviceId?.trim()) {
      return throwError(() => new Error('INVALID_SERVICE_ID'));
    }

    const sanitizedParams = sanitizeReviewsParams(params);

    const httpParams = new HttpParams({
      fromObject: {
        PageNumber: sanitizedParams.pageNumber.toString(),
        PageSize: sanitizedParams.pageSize.toString(),
        SortColumn: sanitizedParams.sortColumn,
        SortDirection: sanitizedParams.sortDirection,
      },
    });

    return this.http
      .get<ApiResponse<ReviewData>>(
        `${this.apiUrl}${environment.reviews.getReviewsByService}${serviceId}`,
        { params: httpParams }
      )
      .pipe(
        timeout(this.API_TIMEOUT),
        map((r) => r.data || createEmptyReviewData()),
        catchError((error) => this.handleError(error, 'getReviews'))
      );
  }

  createReview(review: CreateReviewRequest): Observable<Review> {
    if (!isValidCreateReviewRequest(review)) {
      return throwError(() => new Error('INVALID_REVIEW_DATA'));
    }

    return this.http
      .post<ApiResponse<Review>>(`${this.apiUrl}${environment.reviews.createReview}`, review)
      .pipe(
        timeout(this.API_TIMEOUT),
        map((r) => r.data),
        catchError((error) => this.handleError(error, 'createReview'))
      );
  }
}
