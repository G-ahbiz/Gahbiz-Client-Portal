import { Injectable } from '@angular/core';
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
  mapError(res: ApiResponse<any>): string {
    const message = (res.message ?? '').toString().toLowerCase();
    const sc = res.statusCode;

    if ((sc === 400 || message.includes('badrequest')) && message.includes('already registered')) {
      return 'SIGNUP.MESSAGES.FAILURE_EMAIL_EXISTS';
    }

    if ((sc >= 500 || message.includes('internal') || message.includes('server'))) {
      return 'SIGNUP.MESSAGES.FAILURE_SERVER';
    }

    return 'SIGNUP.MESSAGES.FAILURE';
  }
}
