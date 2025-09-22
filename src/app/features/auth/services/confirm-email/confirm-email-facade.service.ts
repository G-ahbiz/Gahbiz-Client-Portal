import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmEmailApiService } from './confirm-email-api.service';
import { ApiResponse } from '@core/interfaces/api-response';
import { ConfirmEmailRequest } from '@features/auth/interfaces/confirm-email/confirm-email-request';
import { ResendEmailConfirmationRequest } from '@features/auth/interfaces/confirm-email/resend-confirmation-request';
import { ResendConfirmationResponse } from '@features/auth/interfaces/confirm-email/resend-confirmation-response';

@Injectable({
  providedIn: 'root',
})
export class ConfirmEmailFacadeService {
  constructor(private apiService: ConfirmEmailApiService) {}

  confirmEmail(request: ConfirmEmailRequest): Observable<ApiResponse<string>> {
    return this.apiService.confirmEmail(request);
  }

  resendConfirmation(
    request: ResendEmailConfirmationRequest
  ): Observable<ApiResponse<ResendConfirmationResponse>> {
    return this.apiService.resendConfirmation(request);
  }

  confirmEmailLink(userId: string, token: string): Observable<ApiResponse<string>> {
    return this.apiService.confirmEmailLink(userId, token);
  }
}
