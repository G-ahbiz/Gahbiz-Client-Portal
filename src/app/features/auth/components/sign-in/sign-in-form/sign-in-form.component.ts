import { CommonModule } from '@angular/common';
import { Component, inject, input, OnDestroy, output, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoginRequest } from '../../../interfaces/sign-in/login-request';
import { AuthService } from '@core/services/auth.service';
import { REG_EXP, ROUTES } from '@shared/config/constants';
import { Subject, takeUntil } from 'rxjs';
import { InputComponent } from '@shared/components/inputs/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';

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
  ],
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent {
  readonly ROUTES = ROUTES;
  rememberMe = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  isLoading = input<boolean>(false);
  errorMessage = input<string>('');
  signInValues = output<LoginRequest>();

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

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
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
