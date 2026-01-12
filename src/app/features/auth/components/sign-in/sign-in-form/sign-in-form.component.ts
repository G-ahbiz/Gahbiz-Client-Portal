import { CommonModule } from '@angular/common';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginRequest } from '../../../interfaces/sign-in/login-request';
import { REG_EXP, ROUTES } from '@shared/config/constants';
import { InputComponent } from '@shared/components/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FacebookAuthService } from '@core/services/facebook-auth.service';
import { ToastService } from '@shared/services/toast.service';
import { OAuthLoginRequest } from '@core/interfaces/oauth-login-request';
import { SocialSignComponent } from '../../social-sign/social-sign.component';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-sign-in-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    TranslateModule,
    InputComponent,
    ButtonComponent,
    SocialSignComponent,
  ],
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent {
  // Constants
  readonly ROUTES = ROUTES;

  private facebookAuthService = inject(FacebookAuthService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Inputs
  isLoading = input<boolean>(false);
  signInValues = output<LoginRequest>();

  // Outputs
  onGoogleLogin = output<void>();

  disabled = input<boolean>(false);

  // Signals
  rememberMe = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  // Services
  private translate = inject(TranslateService);

  loginForm = new FormGroup({
    identifier: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(REG_EXP.EMAIL),
    ]),
    password: new FormControl('', [Validators.required, Validators.pattern(REG_EXP.PASSWORD)]),
  });

  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.signInValues.emit(this.loginForm.value as LoginRequest);
  }

  googleLogin() {
    this.onGoogleLogin.emit();
    
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }

  getFieldError(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return this.translate.instant('AUTH.ERRORS.REQUIRED');

    if (control.errors['email']) return this.translate.instant('AUTH.ERRORS.EMAIL');

    if (control.errors['pattern']) {
      if (controlName === 'identifier') {
        return this.translate.instant('AUTH.ERRORS.EMAIL');
      }
      if (controlName === 'password') {
        return this.translate.instant('AUTH.ERRORS.PASSWORD_PATTERN');
      }
    }

    return this.translate.instant('AUTH.ERRORS.INVALID');
  }

  async onFacebookLogin() {
    try {
      const accessToken = await this.facebookAuthService.login();

      const loginFormData: OAuthLoginRequest = {
        idToken: accessToken,
        role: 'Client',
        provider: 'Facebook',
      };

      this.authService.externalLogin(loginFormData).subscribe({
        next: (result) => {
          if (result.succeeded) {
            this.router.navigate([this.ROUTES.home]);
          } else {
            this.toastService.error(result.message || 'Login failed. Please try again.');
          }
        },
        error: (error) => {
          this.toastService.error(error.message || 'Login failed. Please try again.');
        },
      });
    } catch (err: any) {
      console.error('❌ FB login failed:', err);
      this.toastService.error(err.message || 'Facebook login failed. Please try again.');
    }
  }
}
