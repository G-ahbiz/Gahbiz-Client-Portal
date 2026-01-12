import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthLoginRequest } from '@core/interfaces/oauth-login-request';
import { AuthService } from '@core/services/auth.service';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { ToastService } from '@shared/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  standalone: true,
  template: `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Completing sign in...</p>
    </div>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #f5f5f5;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
          sans-serif;
      }
      .spinner {
        border: 3px solid rgba(66, 133, 244, 0.3);
        border-top: 3px solid #4285f4;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      p {
        color: #5f6368;
        font-size: 14px;
        margin: 0;
      }
    `,
  ],
})
export class GoogleCallbackComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private route: ActivatedRoute,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }
    this.processGoogleCallback();
  }

  private processGoogleCallback(): void {
    console.log('Processing Google callback...');

    const queryParams = this.route.snapshot.queryParams;
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);

    // Check for errors first
    const error = queryParams['error'] || hashParams.get('error');
    if (error) {
      this.handleOAuthError(error);
      return;
    }

    // Try implicit flow first (id_token in hash)
    const idToken = hashParams.get('id_token') || hashParams.get('idToken');
    const stateFromHash = hashParams.get('state');

    // Try authorization code flow (code in query params)
    const code = queryParams['code'];
    const stateFromQuery = queryParams['state'];

    if (idToken && stateFromHash) {
      this.handleImplicitFlow(idToken, stateFromHash);
    } else if (code && stateFromQuery) {
      this.handleAuthorizationCodeFlow(code, stateFromQuery);
    } else {
      this.handleNoAuthData();
    }
  }

  private handleImplicitFlow(idToken: string, state: string): void {
    if (!this.googleAuthService.validateState(state)) {
      this.toast.error('Security validation failed. Please try again.');
      this.redirectToLogin();
      return;
    }

    const payload: OAuthLoginRequest = {
      idToken: idToken,
      provider: 'Google',
      role: 'Client',
    };

    this.sendLoginRequest(payload);
  }

  private handleAuthorizationCodeFlow(code: string, state: string): void {
    if (!this.googleAuthService.validateState(state)) {
      this.toast.error('Security validation failed.');
      this.redirectToLogin();
      return;
    }

    const payload = {
      code: code,
      provider: 'Google',
      role: 'Client',
      redirectUri: `${window.location.origin}/auth/google/callback`,
    };

    this.sendLoginRequest(payload);
  }

  private sendLoginRequest(payload: any): void {
    this.authService
      .externalLogin(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.handleLoginResponse(res),
        error: (error) => this.handleLoginError(error),
      });
  }

  private handleLoginResponse(res: any): void {
    if (res.succeeded && res.data) {
      // Show success message
      const userName = res.data.user?.name || res.data.user?.email || 'User';
      this.toast.success(`Welcome back, ${userName}!`);

      // Navigate to home after a brief delay to show the toast
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    } else {
      this.toast.error(res.message || 'Login failed. Please try again.');
      this.redirectToLogin();
    }
  }

  private handleLoginError(error: any): void {
    let userMessage = 'Google sign-in failed. Please try again.';
    if (error.status === 401) {
      userMessage = 'Invalid Google credentials.';
    } else if (error.status === 403) {
      userMessage = 'Access denied. Please contact support.';
    } else if (error.status >= 500) {
      userMessage = 'Service temporarily unavailable. Please try again later.';
    }

    this.toast.error(userMessage);
    this.redirectToLogin();
  }

  private handleOAuthError(error: string): void {
    let userMessage = 'Google sign-in was cancelled or failed.';

    switch (error) {
      case 'access_denied':
        userMessage = 'Sign-in request was denied.';
        break;
      case 'popup_closed_by_user':
        userMessage = 'Sign-in window was closed.';
        break;
      case 'immediate_failed':
        userMessage = 'Automatic sign-in failed. Please try manual sign-in.';
        break;
    }

    this.toast.error(userMessage);
    this.redirectToLogin();
  }

  private handleNoAuthData(): void {
    this.toast.error('No authentication data received. Please try again.');
    this.redirectToLogin();
  }

  private redirectToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/auth/sign-in']);
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
