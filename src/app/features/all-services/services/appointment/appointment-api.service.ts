import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiResponse } from '@core/interfaces/api-response';
import { Branch } from '@features/all-services/interfaces/branch';
import { AvailableSlotsResponse } from '@features/all-services/interfaces/appointment/available-slots-response';
import { BookRequest } from '@features/all-services/interfaces/appointment/book-request';
import { AppointmentSettingsResponse } from '@features/all-services/interfaces/appointment/appointment-settings-response';

@Injectable({
  providedIn: 'root',
})
export class AppointmentApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMessage = error.error?.message || error.message || 'An unexpected error occurred';
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  getAvailableSlots(branchId: string): Observable<ApiResponse<AvailableSlotsResponse>> {
    if (!branchId) {
      return throwError(() => new Error('Branch ID is required'));
    }

    const endpoint = environment.appointmentSettings.getAvailableSlots(branchId);
    return this.http
      .get<ApiResponse<AvailableSlotsResponse>>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  bookAppointment(bookRequest: BookRequest): Observable<ApiResponse<any>> {
    const { branchId, date, time } = bookRequest;

    if (!branchId || !date || !time) {
      return throwError(() => new Error('Branch ID, date, and time are required'));
    }

    const endpoint = environment.appointmentSettings.bookAppointment(branchId);
    const params = new HttpParams().set('date', date).set('time', time);

    return this.http
      .post<ApiResponse<any>>(`${this.apiUrl}${endpoint}`, null, { params })
      .pipe(catchError(this.handleError));
  }

  getAppointmentSettings(branchId: string): Observable<ApiResponse<AppointmentSettingsResponse>> {
    const endpoint = environment.appointmentSettings.getAppointmentSettings(branchId);
    return this.http
      .get<ApiResponse<AppointmentSettingsResponse>>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  getBranches(): Observable<ApiResponse<Branch[]>> {
    return this.http
      .get<ApiResponse<Branch[]>>(`${this.apiUrl}${environment.branches.getBranches}`)
      .pipe(catchError(this.handleError));
  }
}
