import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TokenData } from '@core/interfaces/token-data';
import { User } from '@features/auth/interfaces/sign-in/user';
import { LOCAL_STORAGE_KEYS } from '@shared/config/constants';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private platformId = inject(PLATFORM_ID);

  // Cache tokens in memory for better performance
  private accessTokenCache: string | null = null;
  private refreshTokenCache: string | null = null;
  private userDataCache: User | null = null;

  constructor() {
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Load and cache tokens from localStorage
        this.accessTokenCache = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
        this.refreshTokenCache = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);

        const userDataStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
        if (userDataStr) {
          this.userDataCache = JSON.parse(userDataStr);
        }
      } catch (error) {
        console.error('Error initializing TokenService from storage:', error);
        this.clearAllCaches();
      }
    }
  }

  setAccessToken(token: string): void {
    if (!token || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set access token - invalid token or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY, token);
      this.accessTokenCache = token;
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  getAccessToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    // Return cached value first, fallback to localStorage
    if (this.accessTokenCache) {
      return this.accessTokenCache;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
    this.accessTokenCache = token; // Cache it
    return token;
  }

  setRefreshToken(token: string): void {
    if (!token || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set refresh token - invalid token or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY, token);
      this.refreshTokenCache = token;
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.refreshTokenCache) {
      return this.refreshTokenCache;
    }

    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
    this.refreshTokenCache = token;
    return token;
  }

  setUserData(user: User): void {
    if (!user || !isPlatformBrowser(this.platformId)) {
      console.warn('Cannot set user data - invalid user or not in browser');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY, JSON.stringify(user));
      this.userDataCache = user;
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }

  getUserData(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.userDataCache) {
      return this.userDataCache;
    }

    try {
      const userData = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
      if (userData) {
        const parsed = JSON.parse(userData);
        this.userDataCache = parsed;
        return parsed;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
    }

    return null;
  }

  setTokenData(tokenData: TokenData, userData: User): void {
    if (!tokenData || !userData || !tokenData.accessToken || !tokenData.refreshToken) {
      console.warn('Cannot set token data - missing required fields');
      return;
    }

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

  clearAllTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_KEY);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_DATA_KEY);
      } catch (error) {
        console.error('Error clearing tokens from localStorage:', error);
      }
    }
    this.clearAllCaches();
  }

  private clearAllCaches(): void {
    this.accessTokenCache = null;
    this.refreshTokenCache = null;
    this.userDataCache = null;
  }

  getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}
