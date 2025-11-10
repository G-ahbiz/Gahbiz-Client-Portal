import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, throwError, timeout } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CheckoutResponse } from '../interfaces/checkout-response';
import { ApiResponse } from '@core/interfaces/api-response';
import { Order } from '../interfaces/order';
import { ApplyPromoCodeRequest } from '../interfaces/apply-pc-request';
import { ApplyPromoCodeResponse } from '../interfaces/apply-pc-repsonse';

@Injectable({
  providedIn: 'root',
})
export class CheckoutApiService {
  private apiUrl = `${environment.apiUrl}`;
  private readonly timeoutMs = 30000; // 30 seconds
  private readonly maxRetries = 1;

  constructor(private http: HttpClient) {}

  checkout(payload: any): Observable<CheckoutResponse> {
    const url = `${this.apiUrl}${environment.pay.checkout}`;

    const body = payload && payload.payOrder ? payload.payOrder : payload;

    return this.http
      .post<CheckoutResponse>(url, body)
      .pipe(
        timeout(this.timeoutMs),
        retry(this.maxRetries),
        catchError(this.handleError.bind(this))
      );
  }

  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    const url = `${this.apiUrl}${environment.orders.getOrderById(orderId)}`;

    return this.http
      .get<ApiResponse<Order>>(url)
      .pipe(
        timeout(this.timeoutMs),
        retry(this.maxRetries),
        catchError(this.handleError.bind(this))
      );
  }

  submitServiceSubmission(payload: FormData): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}${environment.serviceSubmissions.submitService}`;

    return this.http
      .post<ApiResponse<any>>(url, payload)
      .pipe(
        timeout(this.timeoutMs),
        retry(this.maxRetries),
        catchError(this.handleError.bind(this))
      );
  }

  applyPromoCode(payload: ApplyPromoCodeRequest): Observable<ApiResponse<ApplyPromoCodeResponse>> {
    const url = `${this.apiUrl}${environment.promoCodes.applyPromoCode}`;

    return this.http
      .post<ApiResponse<any>>(url, payload)
      .pipe(
        timeout(this.timeoutMs),
        retry(this.maxRetries),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Request timeout. Please try again.';
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check your information.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please login again.';
          break;
        case 403:
          errorMessage = 'Authorization failed.';
          break;
        case 404:
          errorMessage = 'Checkout service not found.';
          break;
        case 409:
          errorMessage = 'Order conflict. Please verify your cart.';
          break;
        case 422:
          errorMessage = 'Validation failed. Please check your input.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.status}`;
      }
    }

    console.error('Checkout API error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
