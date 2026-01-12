import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '@env/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  private readonly SESSION_STORAGE_KEY = 'google_oauth_state';
  private readonly SESSION_STORAGE_NONCE = 'google_oauth_nonce';

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private document: Document
  ) {}

  /**
   * Method to initiate Google OAuth redirect flow
   */
  login(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Google OAuth is only available in browser environment');
      return;
    }

    // Use current origin for redirect URI
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const clientId = environment.googleClientId;

    // Generate random state for CSRF protection
    const state = this.generateSecureState();
    const nonce = this.generateSecureState();

    // Use sessionStorage for better security (cleared when tab closes)
    sessionStorage.setItem(this.SESSION_STORAGE_KEY, state);
    sessionStorage.setItem(this.SESSION_STORAGE_NONCE, nonce);

    // Build the Google OAuth URL for implicit flow
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    // REQUIRED parameters for implicit flow
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'id_token'); // Use token for access_token + id_token
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    
    // OPTIONAL parameters
    authUrl.searchParams.set('prompt', 'select_account');
    authUrl.searchParams.set('flowName', 'GeneralOAuthFlow');

    console.log('Redirecting to Google OAuth:', authUrl.toString());
    console.log('Redirect URI:', redirectUri);
    console.log('Client ID:', clientId);

    // Perform full page redirect
    this.document.location.href = authUrl.toString();
  }

  /**
   * ALTERNATIVE: Use authorization code flow (more secure, recommended)
   */
  loginWithCodeFlow(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Google OAuth is only available in browser environment');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const clientId = environment.googleClientId;
    const state = this.generateSecureState();

    sessionStorage.setItem(this.SESSION_STORAGE_KEY, state);

    // Authorization code flow URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('access_type', 'offline'); // To get refresh token
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('flowName', 'GeneralOAuthFlow');

    console.log('Using Authorization Code Flow');
    this.document.location.href = authUrl.toString();
  }

  /**
   * Validate state parameter for CSRF protection
   */
  validateState(receivedState: string): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const savedState = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_STORAGE_NONCE);

    if (!savedState || savedState !== receivedState) {
      console.warn('OAuth state validation failed. Possible CSRF attack.');
      console.log('Saved state:', savedState, 'Received:', receivedState);
      return false;
    }

    return true;
  }

  /**
   * Get saved nonce for token validation
   */
  getSavedNonce(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const nonce = sessionStorage.getItem(this.SESSION_STORAGE_NONCE);
    sessionStorage.removeItem(this.SESSION_STORAGE_NONCE);
    return nonce;
  }

  /**
   * Generate cryptographically secure random state
   */
  private generateSecureState(): string {
    const array = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback for older browsers
      return Math.random().toString(36).substring(2) + 
             Math.random().toString(36).substring(2) + 
             Math.random().toString(36).substring(2);
    }
  }
}