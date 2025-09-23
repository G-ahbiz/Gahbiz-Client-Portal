import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FacebookAuthService } from '@core/services/facebook-auth.service';
import { OAuthLoginRequest } from '@core/interfaces/oauth-login-request';
import { LoginResponse } from '@features/auth/interfaces/sign-in/login-response';
import { ApiResponse } from '@core/interfaces/api-response';

@Injectable({ providedIn: 'root' })
export class FacebookAuthFacade {
  private fb = inject(FacebookAuthService);
  private http = inject(HttpClient);

  async login(role: string = 'Client'): Promise<LoginResponse> {
    try {
      // Step 1: Get Facebook access token
      const fbToken = await this.fb.login();

      // Step 2: Build request
      const payload: OAuthLoginRequest = {
        provider: 'Facebook',
        idToken: fbToken,
        role,
      };

      const url = `${environment.apiUrl}${environment.account.externalLogin}`;

      // Step 3: Call backend
      const response = await firstValueFrom(
        this.http.post<ApiResponse<LoginResponse>>(url, payload)
      );

      console.log('🔍 Raw backend response:', response);

      const loginData = response.data;

      // Step 4: Store tokens securely
      localStorage.setItem('accessToken', loginData.token.accessToken);
      localStorage.setItem('refreshToken', loginData.token.refreshToken);

      // Step 5: Logout from Facebook SDK (session cleanup)
      await this.fb.logout();

      return loginData;
    } catch (err) {
      console.error('Facebook login error:', err);
      throw err;
    }
  }
}
