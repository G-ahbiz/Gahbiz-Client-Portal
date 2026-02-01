import { ChangeDetectorRef, Component, computed, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Subscription, finalize } from 'rxjs';
import { ConfirmEmailFacadeService } from '@features/auth/services/confirm-email/confirm-email-facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '@shared/services/toast.service';
import { SignUpResponseStorageService } from '@features/auth/services/sign-up/sign-up-response-storage.service';
import { ROUTES, OTP_CONSTANTS } from '@shared/config/constants';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { removeQueryParams } from '@shared/utils/query-param-utils';
import { LanguageService } from '@core/services/language.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirm-email-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    RouterModule,
    NgOptimizedImage,
  ],
  templateUrl: './confirm-email-form.component.html',
  styleUrls: ['./confirm-email-form.component.scss'],
})
export class ConfirmEmailFormComponent implements OnInit, OnDestroy {
  ROUTES = ROUTES;

  confirmEmailForm: FormGroup;
  resendCooldown = 0;
  isSubmitting = false;
  isLoading = false;
  message = '';

  readonly OTP_CONSTANTS = OTP_CONSTANTS;

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  private _subscription?: Subscription;
  private _confirmLinkSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private facade: ConfirmEmailFacadeService,
    private storage: SignUpResponseStorageService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private languageService: LanguageService,
  ) {
    this.confirmEmailForm = this.fb.group({
      otp: [
        '',
        [
          Validators.required,
          Validators.minLength(OTP_CONSTANTS.MIN),
          Validators.maxLength(OTP_CONSTANTS.MAX),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });
  }

  get otp() {
    return this.confirmEmailForm.get('otp');
  }

  get email(): string {
    return this.storage.email;
  }

  // ==========================
  // OTP Submit
  // ==========================
  onSubmit(): void {
    if (this.confirmEmailForm.invalid || this.isSubmitting) {
      this.otp?.markAsTouched();
      return;
    }

    this.isSubmitting = true;
    const request = { userId: this.storage.userId, otp: this.confirmEmailForm.value.otp };

    this._subscription = this.facade
      .confirmEmail(request)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.storage.clear();
          this.toast.success(this.translate.instant('CONFIRM_EMAIL.MESSAGES.SUCCESS'));
          this.router.navigate([ROUTES.signIn]);
        },
        error: (err) => this.handleOtpError(err),
      });
  }

  private handleOtpError(err: any): void {
    const backendMsg = (err?.error?.message ?? '').toLowerCase();
    let errorKey = 'CONFIRM_EMAIL.MESSAGES.FAILURE';

    if (backendMsg.includes('invalid or expired')) {
      errorKey = 'CONFIRM_EMAIL.MESSAGES.INVALID_OR_EXPIRED';
    } else if (backendMsg.includes('user not found')) {
      errorKey = 'CONFIRM_EMAIL.MESSAGES.USER_NOT_FOUND';
    } else if (backendMsg.includes('already verified')) {
      errorKey = 'CONFIRM_EMAIL.MESSAGES.ALREADY_VERIFIED';
    } else if (backendMsg.includes('failed to update')) {
      errorKey = 'CONFIRM_EMAIL.MESSAGES.UPDATE_FAILED';
    }

    this.toast.error(this.translate.instant(errorKey));
  }

  // ==========================
  // Resend OTP
  // ==========================
  resendEmail(): void {
    if (this.isSubmitting || this.resendCooldown > 0) return;

    const request = { email: this.storage.email, useOtp: true };

    this.facade.resendConfirmation(request).subscribe({
      next: (res) => {
        this.syncStorage(res);
        this.toast.success(this.translate.instant(this.mapResendSuccess(res.message)));
        this.startCooldown();
      },
      error: (err) => {
        this.toast.error(this.translate.instant(this.mapResendError(err)));
      },
    });
  }

  // ==========================
  // Resend Link
  // ==========================
  resendEmailLink(): void {
    if (this.isSubmitting) return;

    const request = { email: this.storage.email, useOtp: false };

    this.facade.resendConfirmation(request).subscribe({
      next: (res) => {
        this.toast.success(this.translate.instant(this.mapResendSuccess(res.message, true)));
        this.router.navigate([ROUTES.signIn]);
      },
      error: (err) => {
        this.toast.error(this.translate.instant(this.mapResendError(err)));
      },
    });
  }

  private syncStorage(res: any): void {
    if (res.data?.userId && res.data?.email) {
      this.storage.setUser(res.data.userId, res.data.email);
    }
  }

  private mapResendSuccess(msg: string, isLink = false): string {
    const backendMsg = (msg ?? '').toLowerCase();

    if (backendMsg.includes('otp sent')) return 'CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_OTP';
    if (backendMsg.includes('verification link sent'))
      return 'CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_LINK';
    if (backendMsg.includes('if your email is registered'))
      return 'CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_GENERIC';

    return isLink
      ? 'CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_LINK'
      : 'CONFIRM_EMAIL.MESSAGES.RESEND_SUCCESS_GENERIC';
  }

  private mapResendError(err: any): string {
    const backendMsg = (err.error?.message ?? '').toLowerCase();
    if (backendMsg.includes('already confirmed')) {
      return 'CONFIRM_EMAIL.MESSAGES.RESEND_ALREADY_VERIFIED';
    }
    return 'CONFIRM_EMAIL.MESSAGES.RESEND_FAILURE';
  }

  startCooldown(): void {
    this.resendCooldown = OTP_CONSTANTS.COOLDOWN;
    const interval = setInterval(() => {
      this.resendCooldown--;
      this.cdr.detectChanges();
      if (this.resendCooldown <= 0) clearInterval(interval);
    }, 1000);
  }

  // ==========================
  // Error Messages
  // ==========================
  getErrorMessageFor(controlName: string): string {
    const control = this.confirmEmailForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return this.translate.instant('CONFIRM_EMAIL.ERRORS.REQUIRED');
    if (control.errors['minlength'] || control.errors['maxlength'])
      return this.translate.instant('CONFIRM_EMAIL.ERRORS.LENGTH', {
        min: OTP_CONSTANTS.MIN,
        max: OTP_CONSTANTS.MAX,
      });
    if (control.errors['pattern']) return this.translate.instant('CONFIRM_EMAIL.ERRORS.DIGITS');

    return this.translate.instant('CONFIRM_EMAIL.ERRORS.INVALID');
  }

  // ==========================
  // OTP Input Handlers
  // ==========================
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    const inputs = Array.from(
      input.parentElement?.querySelectorAll('input') || [],
    ) as HTMLInputElement[];

    // Jump to the first empty input before current
    const firstEmptyIndex = inputs.findIndex((inp) => !inp.value);
    if (firstEmptyIndex !== -1 && firstEmptyIndex < index) {
      input.value = '';
      inputs[firstEmptyIndex].focus();
      return;
    }

    // Allow only single digit
    if (!/^\d$/.test(value) && value !== '') {
      input.value = '';
      return;
    }

    // Update form control
    const current = (this.otp?.value || '').padEnd(this.OTP_CONSTANTS.MAX, ' ');
    const chars = current.split('');
    chars[index] = value;
    this.otp?.setValue(chars.join('').trim());

    // Auto-move next
    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const inputs = Array.from(
      input.parentElement?.querySelectorAll('input') || [],
    ) as HTMLInputElement[];

    if (event.key === 'Backspace' && !input.value && index > 0) {
      inputs[index - 1].focus();
    }
  }

  onPasteOtp(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(pasted)) return;

    const chars = pasted.slice(0, this.OTP_CONSTANTS.MAX).split('');
    this.otp?.setValue(chars.join(''));

    const inputs = Array.from(
      (event.target as HTMLInputElement).parentElement?.querySelectorAll('input') || [],
    ) as HTMLInputElement[];

    inputs.forEach((inp, i) => (inp.value = chars[i] ?? ''));
    const next = inputs[chars.length] || inputs[inputs.length - 1];
    next.focus();
  }

  // ==========================
  // Init / Destroy
  // ==========================
  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const userIdFromQuery = query.get('userId');
    const tokenFromQuery = query.get('token');
    const emailFromQuery = query.get('email') ?? '';

    if (tokenFromQuery) this.storage.setToken(tokenFromQuery);
    if (userIdFromQuery) this.storage.setUser(userIdFromQuery, emailFromQuery, true);

    removeQueryParams(this.router, this.route, ['token', 'userId']);

    const userId = userIdFromQuery || this.storage.userId;
    const token = this.storage.isTokenValid() ? this.storage.getToken() : null;

    if (token && userId) {
      this.confirmViaLink(userId, token);
    }
  }

  private confirmViaLink(userId: string, token: string): void {
    this.isLoading = true;

    this._confirmLinkSub = this.facade.confirmEmailLink(userId, token).subscribe({
      next: () => {
        this.message = this.translate.instant('CONFIRM_EMAIL.MESSAGES.SUCCESS');
        this.toast.success(this.message);
        this.storage.clear();
        this.isLoading = false;
        setTimeout(() => this.router.navigate([ROUTES.signIn]), 3000);
      },
      error: (err) => {
        const backendMsg = (err.error?.message ?? '').toLowerCase();
        if (backendMsg.includes('already confirmed')) {
          this.message = this.translate.instant('CONFIRM_EMAIL.MESSAGES.ALREADY_VERIFIED');
        } else if (backendMsg.includes('invalid') || backendMsg.includes('expired')) {
          this.message = this.translate.instant('CONFIRM_EMAIL.MESSAGES.INVALID_OR_EXPIRED');
        } else {
          this.message = this.translate.instant('CONFIRM_EMAIL.MESSAGES.FAILURE');
        }
        this.toast.error(this.message);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
    this._confirmLinkSub?.unsubscribe();
  }
}
