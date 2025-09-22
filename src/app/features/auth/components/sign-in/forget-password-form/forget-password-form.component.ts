import { Component, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { REG_EXP } from '@shared/config/constants';

@Component({
  selector: 'app-forget-password-form',
  imports: [ButtonComponent, ReactiveFormsModule, RouterLink, MatIconModule, TranslateModule],
  templateUrl: './forget-password-form.component.html',
  styleUrls: ['./forget-password-form.component.scss'],
})
export class ForgetPasswordFormComponent {
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');

  private authService = inject(AuthService);
  private router = inject(Router);

  forgetPasswordForm = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(REG_EXP.EMAIL),
    ]),
  });

  onSubmit() {
    if (this.forgetPasswordForm.invalid) {
      this.forgetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .forgetPassword(this.forgetPasswordForm.value.email as string)
      // .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          if (response.succeeded) {
            this.router.navigate(['/auth/reset-password'], { queryParams: { id: response.data } });
          } else {
            this.errorMessage.set(response.message);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  clearError() {
    this.errorMessage.set('');
  }

  getFieldError(fieldName: string) {
    const field = this.forgetPasswordForm.get(fieldName);

    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email'] || field.errors['pattern']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}
