import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from '../../interfaces/sign-in/login-response';
import { LoginRequest } from '../../interfaces/sign-in/login-request';
import { Observable } from 'rxjs';
import { ApiResponse } from '@core/interfaces/api-response';

@Injectable({
  providedIn: 'root',
})
export class SignInApiService {
  baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    const url = `${this.baseUrl}${environment.account.login}`;
    return this.http.post<ApiResponse<LoginResponse>>(url, request);
  }
}
