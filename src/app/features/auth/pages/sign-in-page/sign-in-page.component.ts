import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { SignInFormComponent } from '../../components/sign-in/sign-in-form/sign-in-form.component';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { LoginRequest } from '@features/auth/interfaces/sign-in/login-request';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ROUTES } from '@shared/config/constants';
import { ToastService } from '@shared/services/toast.service';
import { GoogleAuthService } from '@core/services/google-auth.service';
import { GoogleRequest } from '@core/interfaces/google-request';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInFormComponent, TranslateModule, MatIconModule, RouterModule],
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
})
export class SignInPageComponent implements OnDestroy {
  readonly ROUTES = ROUTES;
  private destroy$ = new Subject<void>();

  isLoading = signal<boolean>(false);

  // Services
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private googleAuthService = inject(GoogleAuthService);

  onSignInValues(values: LoginRequest) {
    this.isLoading.set(true);

    this.authService
      .login(values)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.toastService.error(error.message || 'Login failed. Please try again.');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  onGoogleLogin() {
    this.googleAuthService.initializeGoogleSignIn((response: any) => {
      if (response && response.credential) {
        this.isLoading.set(true);
        const idToken = response.credential;
        const loginFormData: GoogleRequest = {
          idToken: idToken,
          role: 'Client',
          provider: 'Google',
        };
        this.authService.googleLogin(loginFormData).subscribe({
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
        this.toastService.error('Google authentication was canceled or failed.');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
