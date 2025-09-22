import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { SIGNUP_STORAGE_KEYS } from '@shared/config/constants';

@Injectable({
  providedIn: 'root',
})
export class SignUpResponseStorageService {
  private _userId: string = '';
  private _email: string = '';

  private readonly DEFAULT_TOKEN_TTL = environment?.confirmTokenTtlMs ?? 5 * 60 * 1000;

  setUser(userId: string, email: string, persistToSession = false): void {
    this._userId = userId ?? '';
    this._email = email ?? '';

    if (persistToSession) {
      try {
        if (this._userId) sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_USER_ID, this._userId);
        if (this._email) sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_EMAIL, this._email);
      } catch {}
    }
  }

  setToken(token: string, ttlMs: number = this.DEFAULT_TOKEN_TTL): void {
    if (!token) return;
    try {
      const expiresAt = Date.now() + ttlMs;
      sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN, token);
      sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN_EXPIRES, String(expiresAt));
    } catch {}
  }

  getToken(): string | null {
    try {
      return sessionStorage.getItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN);
    } catch {
      return null;
    }
  }

  isTokenValid(): boolean {
    try {
      const token = sessionStorage.getItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN);
      const expires = Number(sessionStorage.getItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN_EXPIRES) ?? '0');
      if (!token) return false;
      if (expires && Date.now() > expires) {
        this.clearToken();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  clearToken(): void {
    try {
      sessionStorage.removeItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN);
      sessionStorage.removeItem(SIGNUP_STORAGE_KEYS.KEY_TOKEN_EXPIRES);
    } catch {}
  }

  get userId(): string {
    if (this._userId) return this._userId;
    try {
      const v = sessionStorage.getItem(SIGNUP_STORAGE_KEYS.KEY_USER_ID);
      if (v) {
        this._userId = v;
        return v;
      }
    } catch {}
    return '';
  }

  get email(): string {
    if (this._email) return this._email;
    try {
      const v = sessionStorage.getItem(SIGNUP_STORAGE_KEYS.KEY_EMAIL);
      if (v) {
        this._email = v;
        return v;
      }
    } catch {}
    return '';
  }

  // Clears both in-memory and sessionStorage data
  clear(): void {
    this._userId = '';
    this._email = '';
    try {
      sessionStorage.removeItem(SIGNUP_STORAGE_KEYS.KEY_USER_ID);
      sessionStorage.removeItem(SIGNUP_STORAGE_KEYS.KEY_EMAIL);
      this.clearToken();
    } catch {}
  }

  populateFromQueryParams(userId?: string, email?: string, token?: string, ttlMs?: number): void {
    if (userId) {
      this._userId = userId;
      try {
        sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_USER_ID, userId);
      } catch {}
    }
    if (email) {
      this._email = email;
      try {
        sessionStorage.setItem(SIGNUP_STORAGE_KEYS.KEY_EMAIL, email);
      } catch {}
    }
    if (token) {
      this.setToken(token, ttlMs ?? this.DEFAULT_TOKEN_TTL);
    }
  }
}
