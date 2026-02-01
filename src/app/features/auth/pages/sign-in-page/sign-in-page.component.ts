import { Component, inject, computed, OnDestroy, signal } from '@angular/core';
import { SignInFormComponent } from '../../components/sign-in/sign-in-form/sign-in-form.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES } from '@shared/config/constants';
import { ToastService } from '@shared/services/toast.service';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { OAuthLoginRequest } from '@core/interfaces/oauth-login-request';
import { FacebookAuthService } from '@core/services/facebook-auth.service';
import { LanguageService } from '@core/services/language.service';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInFormComponent, TranslateModule, RouterModule, NgOptimizedImage],
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
})
export class SignInPageComponent implements OnDestroy {
  readonly ROUTES = ROUTES;
  private destroy$ = new Subject<void>();

  isLoading = signal<boolean>(false);
  googleLoading = signal<boolean>(false);

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private googleAuthService = inject(GoogleAuthService);
  private facebookAuthService = inject(FacebookAuthService);
  private languageService = inject(LanguageService);

  onSignInValues(values: LoginRequest) {
    this.isLoading.set(true);
    this.authService
      .login(values)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // Show success toast
          const userName = response.user?.fullName || response.user?.email || 'User';
          this.toastService.success(`Welcome back, ${userName}!`);

          // Navigate to home
          this.router.navigate([ROUTES.home]);
        },
        error: (error) => {
          this.toastService.error(error.message || 'Login failed. Please try again.');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  onGoogleLogin() {
    this.googleLoading.set(true);
    this.googleAuthService.login();
  }

  onFacebookLogin() {
    this.isLoading.set(true);
    this.facebookAuthService
      .login()
      .then((accessToken: string) => {
        if (accessToken) {
          const loginFormData: OAuthLoginRequest = {
            idToken: accessToken,
            role: 'Client',
            provider: 'Facebook',
          };
          this.authService.externalLogin(loginFormData).subscribe({
            next: (result) => {
              if (result.succeeded) {
                this.router.navigate([ROUTES.home]);
              } else {
                this.toastService.error(result.message || 'Login failed. Please try again.');
              }
              this.isLoading.set(false);
            },
            error: (error) => {
              this.toastService.error(error.message || 'Login failed. Please try again.');
              this.isLoading.set(false);
            },
          });
        } else {
          this.toastService.error('Facebook authentication was canceled or failed.');
          this.isLoading.set(false);
        }
      })
      .catch((error) => {
        this.toastService.error(error.message || 'Facebook login failed. Please try again.');
        this.isLoading.set(false);
      });
  }

  navigateToHome() {
    this.router.navigate([ROUTES.home]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
