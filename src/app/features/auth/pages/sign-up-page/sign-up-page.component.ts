import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ROUTES } from '../../../../shared/config/constants';
import { SignUpFormComponent } from '../../components/sign-up/sign-up-form/sign-up-form.component';
import { SocialSignComponent } from '../../components/social-sign/social-sign.component';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { GoogleRequest } from '@core/interfaces/google-request';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { LanguageService } from '@core/services/language.service';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SignUpFormComponent, SocialSignComponent, TranslateModule],
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent {
  readonly ROUTES = ROUTES;

  // Use computed to create a direction signal
  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  private googleAuthService = inject(GoogleAuthService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);

  private googleRegister: GoogleRequest = {} as GoogleRequest;

  onGoogleRegister() {
    this.googleAuthService.initializeGoogleSignIn((response: any) => {
      if (response && response.credential) {
        this.googleRegister.idToken = response.credential;
        this.googleRegister.provider = 'Google';
        this.googleRegister.role = 'Client';

        this.authService.googleLogin(this.googleRegister).subscribe({
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
        this.toastService.error('Google authentication was canceled or failed.');
      }
    });
  }
}
