import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfirmEmailRequest } from '../../interfaces/confirm-email/confirm-email-request';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '../../../../../environments/environment';
import { ResendEmailConfirmationRequest } from '@features/auth/interfaces/confirm-email/resend-confirmation-request';
import { ResendConfirmationResponse } from '@features/auth/interfaces/confirm-email/resend-confirmation-response';

@Injectable({ providedIn: 'root' })
export class ConfirmEmailApiService {
  private readonly _confirmUrl = `${environment.apiUrl}${environment.account.verifyOtp}`;
  private readonly _resendUrl = `${environment.apiUrl}${environment.account.resendEmailConfirmation}`;
  private readonly _confirmUrlLink = `${environment.apiUrl}${environment.account.confirmEmail}`;

  constructor(private http: HttpClient) {}

  confirmEmail(request: ConfirmEmailRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(this._confirmUrl, request);
  }

  resendConfirmation(
    request: ResendEmailConfirmationRequest
  ): Observable<ApiResponse<ResendConfirmationResponse>> {
    return this.http.post<ApiResponse<ResendConfirmationResponse>>(this._resendUrl, request);
  }

  confirmEmailLink(userId: string, token: string): Observable<ApiResponse<string>> {
    const params = new HttpParams().set('userId', userId).set('token', token);
    return this.http.get<ApiResponse<string>>(this._confirmUrlLink, { params });
  }
}
