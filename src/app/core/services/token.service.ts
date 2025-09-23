import { Injectable } from '@angular/core';
import { TokenData } from '@core/interfaces/token-data';
import { User } from '@features/auth/interfaces/sign-in/user';
import { LOCAL_STORAGE_KEYS } from '@shared/config/constants';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  setAccessToken(token: string): void {
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY, token);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    if (token) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY, token);
    }
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
  }

  setUserData(user: User): void {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY, JSON.stringify(user));
    }
  }

  getUserData(): User | null {
    const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  setTokenData(tokenData: TokenData, userData: User): void {
    this.setAccessToken(tokenData.accessToken);
    this.setRefreshToken(tokenData.refreshToken);
    this.setUserData(userData);
  }

  hasAccessToken(): boolean {
    const token = this.getAccessToken();
    return token !== null && token.trim() !== '';
  }

  hasRefreshToken(): boolean {
    const token = this.getRefreshToken();
    return token !== null && token.trim() !== '';
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      if (!payload.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    return this.isTokenExpired(token || '');
  }

  isRefreshTokenExpired(): boolean {
    const token = this.getRefreshToken();
    return this.isTokenExpired(token || '');
  }

  decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  getTokenInfo(token: string): any {
    try {
      return this.decodeToken(token);
    } catch (error) {
      return null;
    }
  }

  clearAllTokens(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
  }

  clearAccessToken(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
  }

  areTokensValid(): boolean {
    const hasAccess = this.hasAccessToken();
    const hasRefresh = this.hasRefreshToken();

    if (!hasAccess || !hasRefresh) {
      return false;
    }

    if (this.isRefreshTokenExpired()) {
      return false;
    }

    return true;
  }

  needsRefresh(): boolean {
    if (!this.hasAccessToken() || !this.hasRefreshToken()) {
      return false;
    }

    return this.isAccessTokenExpired() && !this.isRefreshTokenExpired();
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}
