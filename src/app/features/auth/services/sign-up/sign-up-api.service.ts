import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../core/interfaces/api-response';
import { SignUpDetails } from '../../interfaces/sign-up/sign-up-details';
import { SignUpResponse } from '../../interfaces/sign-up/sign-up-response';

@Injectable({
  providedIn: 'root'
})
export class SignUpApiService {
  private readonly _apiUrl = `${environment.apiUrl}${environment.account.signup}`;

  constructor(private http: HttpClient) {}

  register(details: SignUpDetails): Observable<ApiResponse<SignUpResponse>> {
    return this.http.post<ApiResponse<SignUpResponse>>(this._apiUrl, details);
  }
}
