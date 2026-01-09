import { inject, Injectable } from '@angular/core';
import { AppointmentApiService } from './appointment-api.service';
import { map, catchError, of, Observable, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Branch } from '@features/all-services/interfaces/branch';
import { ToastService } from '@shared/services/toast.service';
import { AvailableSlotsResponse } from '@features/all-services/interfaces/appointment/available-slots-response';
import { BookRequest } from '@features/all-services/interfaces/appointment/book-request';
import { AppointmentSettingsResponse } from '@features/all-services/interfaces/appointment/appointment-settings-response';

@Injectable({
  providedIn: 'root',
})
export class AppointmentFacadeService {
  private readonly api = inject(AppointmentApiService);
  private readonly toastService = inject(ToastService);

  getAvailableSlots(branchId: string): Observable<AvailableSlotsResponse> {
    return this.api.getAvailableSlots(branchId).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to load available slots');
        }
        return response.data || {};
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const userMessage = 'Could not load available appointments.';
        console.error('Error loading available slots:', error.message);
        this.toastService.error(userMessage);
        return of({});
      })
    );
  }

  getAppointmentSettings(branchId: string): Observable<AppointmentSettingsResponse> {
    return this.api.getAppointmentSettings(branchId).pipe(
      map((response) => {
        return response.data || {};
      })
    );
  }

  bookAppointment(bookRequest: BookRequest): Observable<boolean> {
    return this.api.bookAppointment(bookRequest).pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to book appointment');
        }
        return true;
      }),
      tap(() => {
        this.toastService.success('Appointment booked successfully!');
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const userMessage = 'Could not book the appointment. Please try again.';
        console.error('Error booking appointment:', error.message);
        this.toastService.error(userMessage);
        return of(false);
      })
    );
  }

  getBranches(): Observable<Branch[]> {
    return this.api.getBranches().pipe(
      map((response) => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to load branches');
        }
        return response.data || [];
      }),
      catchError((error: HttpErrorResponse | Error) => {
        const userMessage = 'Could not load branch locations.';
        console.error('Error loading branches:', error.message);
        this.toastService.error(userMessage);
        return of([]);
      })
    );
  }
}
