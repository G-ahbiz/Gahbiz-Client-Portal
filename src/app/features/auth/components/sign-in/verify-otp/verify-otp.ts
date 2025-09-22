import {
  Component,
  inject,
  signal,
  ChangeDetectionStrategy,
  input,
  output,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Subject, takeUntil } from 'rxjs';
import { REG_EXP } from '@shared/config/constants';

@Component({
  selector: 'app-verify-otp',
  imports: [ButtonComponent, RouterLink, ReactiveFormsModule, MatIconModule, TranslateModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtp implements OnDestroy {
  private destroy$ = new Subject<void>();
  // Input from parent component
  userId = input<string>('');

  // Output to parent component
  otpVerified = output<string>();

  isLoading = signal<boolean>(false);

  // Ziad : TODO : replace with toastr
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  private authService = inject(AuthService);
  verifyPassForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(4),
      Validators.pattern(REG_EXP.OTP),
    ]),
  });

  // OTP input handling methods
  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow digits
    if (!/^\d$/.test(value) && value !== '') {
      input.value = '';
      return;
    }

    // Update the form control with all OTP digits
    const currentCode = this.verifyPassForm.get('code')?.value || '';
    const newCode = currentCode.split('');
    newCode[index] = value;
    this.verifyPassForm.get('code')?.setValue(newCode.join(''));

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = input.parentElement?.querySelector(
        `input:nth-child(${index + 2})`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Handle backspace
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.parentElement?.querySelector(
        `input:nth-child(${index})`
      ) as HTMLInputElement;
      prevInput?.focus();
    }

    // Handle paste
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length === 4) {
          this.verifyPassForm.get('code')?.setValue(digits);
          // Focus the last input
          const lastInput = input.parentElement?.querySelector(
            'input:last-child'
          ) as HTMLInputElement;
          lastInput?.focus();
        }
      });
    }
  }

  resendCode() {
    this.authService
      .resendCode(this.userId())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.successMessage.set('Code resent successfully!');
          } else {
            this.errorMessage.set(response.message || 'Failed to resend code');
          }
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Failed to resend code');
        },
      });
  }

  clearError() {
    this.errorMessage.set('');
  }

  clearSuccess() {
    this.successMessage.set('');
  }

  onSubmit() {
    if (this.verifyPassForm.invalid) {
      this.verifyPassForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.clearError();
    this.clearSuccess();

    const otpCode = this.verifyPassForm.get('code')?.value;
    this.otpVerified.emit(otpCode || '');
  }

  getFieldError(fieldName: string) {
    const field = this.verifyPassForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength'] || field.errors['maxlength']) {
        return `${fieldName} must be 4 digits`;
      }
      if (field.errors['pattern']) {
        return `${fieldName} must contain only numbers`;
      }
    }
    return '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
