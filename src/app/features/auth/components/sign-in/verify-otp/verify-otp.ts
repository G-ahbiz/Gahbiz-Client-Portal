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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Subject, takeUntil } from 'rxjs';
import { OTP_OPERATIONS, REG_EXP } from '@shared/config/constants';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-verify-otp',
  imports: [ButtonComponent, RouterLink, ReactiveFormsModule, MatIconModule, TranslateModule],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyOtp implements OnDestroy {
  readonly OTP_OPERATIONS = OTP_OPERATIONS;
  private destroy$ = new Subject<void>();
  // Input from parent component
  userId = input<string>('');

  // Output to parent component
  otpVerified = output<string>();

  // Services
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  isLoading = signal<boolean>(false);

  verifyPassForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
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
    if (value && index < 5) {
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
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
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
      .resendCode(this.userId(), this.OTP_OPERATIONS.FORGOT_PASSWORD)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.toastService.success('Code resent successfully!');
          } else {
            this.toastService.error(response.message || 'Failed to resend code');
          }
        },
        error: (error) => {
          this.toastService.error(error.message || 'Failed to resend code');
        },
      });
  }

  onSubmit() {
    if (this.verifyPassForm.invalid) {
      this.verifyPassForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const otpCode = this.verifyPassForm.get('code')?.value;
    this.otpVerified.emit(otpCode || '');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
