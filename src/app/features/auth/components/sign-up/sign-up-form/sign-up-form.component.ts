import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PhoneInputComponent } from '../../../../../shared/components/inputs/phone-input/phone-input.component';
import { InputComponent } from '../../../../../shared/components/inputs/input/input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { Subscription, finalize } from 'rxjs';
import { SignUpFacadeService } from '../../../services/sign-up/sign-up-facade.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ROUTES, SIGNUP_CONSTANTS } from '../../../../../shared/config/constants';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PhoneInputComponent,
    InputComponent,
    ButtonComponent,
    TranslateModule,
  ],
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss'],
})
export class SignUpFormComponent {
  signUpForm: FormGroup;
  isSubmitting = false;

  private _subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private facade: SignUpFacadeService,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(SIGNUP_CONSTANTS.NAME_MIN),
          Validators.maxLength(SIGNUP_CONSTANTS.NAME_MAX),
          Validators.pattern(/^[\p{L}\s'-]+$/u),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{6,14}$/)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(SIGNUP_CONSTANTS.PASSWORD_MIN),
          Validators.maxLength(SIGNUP_CONSTANTS.PASSWORD_MAX),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^])[A-Za-z\d@$!%*?&.#^]+$/
          ),
        ],
      ],
      terms: [false, Validators.requiredTrue],
    });
  }

  // getters
  get name() {
    return this.signUpForm.get('name');
  }
  get email() {
    return this.signUpForm.get('email');
  }
  get phoneNumber() {
    return this.signUpForm.get('phoneNumber');
  }
  get password() {
    return this.signUpForm.get('password');
  }

  toggleTerms(): void {
    const currentValue = this.signUpForm.get('terms')?.value;
    this.signUpForm.get('terms')?.setValue(!currentValue);
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this._markFormGroupTouched(this.signUpForm);
      return;
    }

    this.isSubmitting = true;

    this._subscription = this.facade
      .register(this.signUpForm.value)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          if (res.succeeded) {
            const userEmail = res.data?.email ?? this.signUpForm.get('email')?.value;
            const msg = this.translate.instant('SIGNUP.MESSAGES.SUCCESS_DETAIL', {
              email: userEmail,
            });
            this.toast.success(msg);
            this.router.navigate([ROUTES.signIn]);
          } else {
            const errorKey = this.facade.mapError(res);
            this.toast.error(this.translate.instant(errorKey));
          }
        },
        error: (err) => {
          console.error('Signup request error:', err);
          const backendMsg = err?.error?.message ?? '';
          const errorKey = backendMsg.toLowerCase().includes('already registered')
            ? 'SIGNUP.MESSAGES.FAILURE_EMAIL_EXISTS'
            : 'SIGNUP.MESSAGES.FAILURE_SERVER';
          this.toast.error(this.translate.instant(errorKey));
        },
      });
  }

  private _markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if ((control as any).controls) {
        this._markFormGroupTouched(control as FormGroup);
      }
    });
  }

  getErrorMessageFor(controlName: string): string {
    const control = this.signUpForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return this.translate.instant('SIGNUP.ERRORS.REQUIRED');

    if (control.errors['minlength']) {
      return this.translate.instant('SIGNUP.ERRORS.MIN_LENGTH', {
        requiredLength: control.errors['minlength'].requiredLength,
      });
    }

    if (control.errors['maxlength']) {
      return this.translate.instant('SIGNUP.ERRORS.MAX_LENGTH', {
        requiredLength: control.errors['maxlength'].requiredLength,
      });
    }

    if (control.errors['email']) return this.translate.instant('SIGNUP.ERRORS.EMAIL');

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'name':
          return this.translate.instant('SIGNUP.ERRORS.FULLNAME_PATTERN');
        case 'phoneNumber':
          return this.translate.instant('SIGNUP.ERRORS.PHONE_PATTERN');
        case 'password':
          return this.translate.instant('SIGNUP.ERRORS.PASSWORD_PATTERN');
      }
    }

    return this.translate.instant('SIGNUP.ERRORS.INVALID');
  }

  ngOnDestroy(): void {
    this._subscription?.unsubscribe();
  }
}
