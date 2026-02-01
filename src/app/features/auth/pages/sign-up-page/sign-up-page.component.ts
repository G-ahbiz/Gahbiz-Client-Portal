import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ROUTES } from '../../../../shared/config/constants';
import { SignUpFormComponent } from '../../components/sign-up/sign-up-form/sign-up-form.component';
import { SocialSignComponent } from '../../components/social-sign/social-sign.component';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { FacebookAuthService } from '@core/services/facebook-auth.service';
import { OAuthLoginRequest } from '@core/interfaces/oauth-login-request';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SignUpFormComponent,
    SocialSignComponent,
    TranslateModule,
    NgOptimizedImage,
  ],
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent {
  readonly ROUTES = ROUTES;

  // Use computed to create a direction signal
  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  // Loading states
  googleLoading = signal<boolean>(false);

  private googleAuthService = inject(GoogleAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private facebookAuthService = inject(FacebookAuthService);

  private facebookRegister: OAuthLoginRequest = {} as OAuthLoginRequest;

  private languageService = inject(LanguageService);

  onGoogleRegister() {
    this.googleLoading.set(true);
    this.googleAuthService.login();
  }

  navigateToHome() {
    this.router.navigate([ROUTES.home]);
  }

  onFacebookRegister() {
    this.facebookAuthService
      .login()
      .then((accessToken: string) => {
        if (accessToken) {
          this.facebookRegister.idToken = accessToken;
          this.facebookRegister.provider = 'Facebook';
          this.facebookRegister.role = 'Client';

          this.authService.externalLogin(this.facebookRegister).subscribe({
            next: (result) => {
              if (result.succeeded) {
                this.router.navigate([ROUTES.home]);
              } else {
                this.toastService.error(result.message || 'Login failed. Please try again.');
              }
            },
            error: (error) => {
              this.toastService.error(error.message || 'Login failed. Please try again.');
            },
          });
        } else {
          this.toastService.error('Facebook authentication was canceled or failed.');
        }
      })
      .catch((error) => {
        this.toastService.error(error.message || 'Facebook login failed. Please try again.');
      });
  }
}
