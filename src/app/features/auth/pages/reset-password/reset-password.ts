import { Component, signal, inject, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@core/services/auth.service';
import { ResetPasswordRequest } from '@features/auth/interfaces/sign-in/reset-password-request';
import { VerifyOtp } from '@features/auth/components/sign-in/verify-otp/verify-otp';
import { NewPassword } from '@features/auth/components/sign-in/new-password/new-password';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  imports: [VerifyOtp, NewPassword, MatIconModule, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword implements OnDestroy {
  // Current step in the reset password flow

  private destroy$ = new Subject<void>();
  currentStep = signal<'verify-otp' | 'new-password'>('verify-otp');

  // Data collected from the flow
  userId = signal<string>('');
  otpCode = signal<string>('');
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');

  // Loading and error states
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Services
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    // Get userId from query params
    this.route.queryParams.subscribe((params) => {
      this.userId.set(params['id'] || '');
    });

    console.log(this.userId());
  }

  // Called when OTP verification is successful
  onOtpVerified(otp: string) {
    this.otpCode.set(otp);
    this.currentStep.set('new-password');
  }

  // Called when new password form is submitted
  onPasswordSubmitted(passwordData: { newPassword: string; confirmPassword: string }) {
    this.newPassword.set(passwordData.newPassword);
    this.confirmPassword.set(passwordData.confirmPassword);

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    // Submit the reset password request
    this.submitResetPasswordRequest();
  }

  // Submit the final reset password request
  private submitResetPasswordRequest() {
    this.isLoading.set(true);
    this.clearError();
    this.clearSuccess();

    const resetPasswordRequest: ResetPasswordRequest = {
      userId: this.userId(),
      otp: this.otpCode(),
      newPassword: this.newPassword(),
      confirmPassword: this.confirmPassword(),
      token: '',
    };

    this.authService
      .resetPassword(true, resetPasswordRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.successMessage.set('Password reset successfully!');
            setTimeout(() => {
              this.router.navigate(['/auth/sign-in']);
            }, 2000);
          } else {
            this.errorMessage.set(response.message || 'Failed to reset password');
          }
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'An error occurred while resetting password');
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  // Go back to OTP verification step
  goBackToOtp() {
    this.currentStep.set('verify-otp');
    this.clearError();
    this.clearSuccess();
  }

  clearError() {
    this.errorMessage.set('');
  }

  clearSuccess() {
    this.successMessage.set('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
