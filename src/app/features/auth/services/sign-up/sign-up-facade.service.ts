import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/interfaces/api-response';
import { SignUpApiService } from './sign-up-api.service';
import { SignUpDetails } from '../../interfaces/sign-up/sign-up-details';
import { SignUpResponse } from '../../interfaces/sign-up/sign-up-response';

@Injectable({
  providedIn: 'root',
})
export class SignUpFacadeService {
  constructor(private api: SignUpApiService) {}

  register(details: SignUpDetails): Observable<ApiResponse<SignUpResponse>> {
    return this.api.register(details);
  }

  // Interpret and map error responses to user-friendly message keys
  public mapError(resOrErr: ApiResponse<any> | HttpErrorResponse | any): string {
    // 1) If HttpErrorResponse, extract the server payload from err.error if present
    let payload: any = resOrErr;
    if (resOrErr instanceof HttpErrorResponse) {
      payload = resOrErr.error ?? {};
    } else if (resOrErr && resOrErr.error && typeof resOrErr.error === 'object') {
      // sometimes the wrapper has an 'error' property containing payload
      payload = resOrErr.error;
    }

    // 2) Normalize values from payload OR fallback to top-level
    const rawMessage = payload?.message ?? resOrErr?.message ?? '';
    const message = String(rawMessage).toLowerCase().trim();
    const scRaw = payload?.statusCode ?? payload?.status ?? resOrErr?.status ?? '';
    const sc = String(scRaw).toLowerCase();

    // 3) Mapping rules
    // Email already exists
    if (
      (sc === '400' || sc === 'badrequest' || sc.includes('400') || sc.includes('badrequest')) &&
      (message.includes('already registered') ||
        message.includes('already exists') ||
        message.includes('in use'))
    ) {
      return 'SIGNUP.MESSAGES.FAILURE_EMAIL_EXISTS';
    }

    // Validation / client errors with structured errors
    if (
      (sc === '400' || sc === 'badrequest') &&
      (payload?.errors || (Array.isArray(payload?.errors) && payload.errors.length))
    ) {
      return 'SIGNUP.MESSAGES.FAILURE_INVALID_INPUT';
    }

    // Server-side errors
    if (
      sc.startsWith('5') ||
      sc.includes('internal') ||
      message.includes('server') ||
      message.includes('internal server')
    ) {
      return 'SIGNUP.MESSAGES.FAILURE_SERVER';
    }

    // 4) If backend returned succeeded:false with a readable message, try to match it directly
    if (message) {
      if (
        message.includes('already registered') ||
        message.includes('already exists') ||
        message.includes('in use')
      ) {
        return 'SIGNUP.MESSAGES.FAILURE_EMAIL_EXISTS';
      }
      if (message.includes('password') && message.includes('weak')) {
        return 'SIGNUP.MESSAGES.FAILURE_WEAK_PASSWORD';
      }
    }

    // 5) Final fallback & debug log
    console.warn('Unmapped backend error in SignUpFacade.mapError', {
      sc,
      rawMessage: rawMessage ?? undefined,
      errors: payload?.errors,
    });
    return 'SIGNUP.MESSAGES.FAILURE';
  }
}
