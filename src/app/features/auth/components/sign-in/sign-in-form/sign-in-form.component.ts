import { CommonModule } from '@angular/common';
import { Component, inject, Input, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LoginRequest } from '../../../interfaces/sign-in/login-request';
import { REG_EXP, ROUTES } from '@shared/config/constants';
import { InputComponent } from '@shared/components/inputs/input/input.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FacebookAuthFacade } from '@features/auth/services/sign-in/facebook-auth-facade.service';

@Component({
  selector: 'app-sign-in-form',
  standalone: true,
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
  private fbFacade = inject(FacebookAuthFacade);
  private router = inject(Router);

  @Input() isLoading: boolean = false;
  @Input() errorMessage: string | null = null;

  signInValues = output<LoginRequest>();

  rememberMe = false;
  showPassword = false;

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
    this.showPassword = !this.showPassword;
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

  async onFacebookLogin() {
    try {
      const response = await this.fbFacade.login();
      console.log('✅ FB login success:', response);
      this.router.navigate([this.ROUTES.home]);
    } catch (err: any) {
      console.error('❌ FB login failed:', err);
    }
  }
}
