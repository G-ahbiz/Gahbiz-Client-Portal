import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SignInApiService } from '../../../services/sign-in/sign-in-api.service';
import { LoginRequest } from '../../../interfaces/sign-in/login-request';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { REG_EXP } from '@shared/config/constants';
import { ROUTES } from '@shared/config/constants';

@Component({
  selector: 'app-sign-in-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent {
  // TODO : handle the remmber me (add button - handle logic)

  readonly ROUTES = ROUTES;

  rememberMe = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = new FormGroup({
    identifier: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(REG_EXP.EMAIL),
    ]),
    password: new FormControl('', [Validators.required, Validators.pattern(REG_EXP.PASSWORD)]),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(this.loginForm.value as LoginRequest)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage.set(error.message || 'Login failed. Please try again.');
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }

  clearError() {
    this.errorMessage.set('');
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'identifier' ? 'Email' : 'Password'} is required`;
      }
      if (field.errors['email'] || field.errors['pattern']) {
        if (fieldName === 'identifier') {
          return 'Please enter a valid email address';
        }
        if (fieldName === 'password') {
          return 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
        }
      }
    }
    return '';
  }
}
