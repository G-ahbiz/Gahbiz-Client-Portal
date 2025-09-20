import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { TokenData } from '@core/interfaces/token-data';
import { environment } from '@env/environment';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { User } from '@features/auth/interfaces/sign-in/user';
import { BehaviorSubject, Observable, map, catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { LoginResponse } from '@features/auth/interfaces/sign-in/login-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private http = inject(HttpClient);
  private tokenService = inject(TokenService);

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const user = this.tokenService.getUserData();
    const tokensValid = this.tokenService.areTokensValid();

    if (user && tokensValid) {
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    } else {
      this.clearAuthState();
    }
  }

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}${environment.account.login}`, loginData)
      .pipe(
        map((response) => {
          if (response.succeeded && response.data) {
            this.setAuthData(response.data.token, response.data.user);
            return response.data;
          } else {
            throw new Error(response.message || 'Login failed');
          }
        }),
        catchError(this.handleError)
      );
  }

  refreshToken(): Observable<TokenData> {
    const refreshToken = this.tokenService.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<ApiResponse<{ token: TokenData }>>(`${this.apiUrl}${environment.account.refresh}`, {
        refreshToken: refreshToken,
      })
      .pipe(
        map((response) => {
          if (response.succeeded && response.data) {
            this.tokenService.setAccessToken(response.data.token.accessToken);
            this.tokenService.setRefreshToken(response.data.token.refreshToken);
            return response.data.token;
          } else {
            throw new Error(response.message || 'Token refresh failed');
          }
        }),
        catchError((error) => {
          this.logout();
          return this.handleError(error);
        })
      );
  }

  logout(): void {
    this.clearAuthState();
  }

  isAuthenticated(): boolean {
    const tokensValid = this.tokenService.areTokensValid();
    const hasUser = this.currentUserSubject.value !== null;
    return tokensValid && hasUser;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  needsTokenRefresh(): boolean {
    return this.tokenService.needsRefresh();
  }

  getAuthToken(): string | null {
    return this.tokenService.getAccessToken();
  }

  getAuthorizationHeader(): string | null {
    return this.tokenService.getAuthorizationHeader();
  }

  private setAuthData(tokenData: TokenData, userData: User): void {
    this.tokenService.setTokenData(tokenData, userData);
    this.currentUserSubject.next(userData);
    this.isLoggedInSubject.next(true);
  }

  private clearAuthState(): void {
    this.tokenService.clearAllTokens();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Service not found';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
        default:
          errorMessage = error.error?.message || `Error Code: ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
