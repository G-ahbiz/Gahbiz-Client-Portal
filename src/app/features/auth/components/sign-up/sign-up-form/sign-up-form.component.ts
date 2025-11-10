import { ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { Subscription, finalize } from 'rxjs';
import { SignUpFacadeService } from '../../../services/sign-up/sign-up-facade.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ROUTES, SIGNUP_CONSTANTS } from '../../../../../shared/config/constants';
import { SignUpResponseStorageService } from '@features/auth/services/sign-up/sign-up-response-storage.service';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, TranslateModule],
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
    private router: Router,
    private signUpResponseStorage: SignUpResponseStorageService
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
      phoneNumber: ['', [Validators.required, this.phoneFormatValidator.bind(this)]],
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

  private phoneFormatValidator(control: AbstractControl): ValidationErrors | null {
    const raw = control.value;
    if (!raw || raw.toString().trim() === '') return null;

    let v = String(raw).trim();

    v = v.replace(/^00/, '+');
    v = v.replace(/[\s-.()]/g, '');

    if (/^\d{10}$/.test(v)) {
      v = '+1' + v;
    }

    const usRegex = /^\+1[2-9]\d{9}$/;
    const intlE164 = /^\+[1-9]\d{6,14}$/;

    if (v.startsWith('+1')) {
      if (!usRegex.test(v)) return { invalidUSPhone: true };
    } else {
      if (!intlE164.test(v)) return { invalidPhone: true };
    }

    return null;
  }

  onPhoneBlur(): void {
    const phoneControl = this.signUpForm.get('phoneNumber');
    if (!phoneControl) return;

    let v = String(phoneControl.value || '').trim();
    if (!v) {
      phoneControl.markAsTouched();
      phoneControl.updateValueAndValidity();
      this.cdr.detectChanges();
      return;
    }

    v = v.replace(/^00/, '+');
    v = v.replace(/[\s-.()]/g, '');

    if (/^\d{10}$/.test(v)) v = '+1' + v;

    phoneControl.setValue(v);
    phoneControl.markAsTouched();
    phoneControl.updateValueAndValidity();
    this.cdr.detectChanges();
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
            const userId = res.data?.userId;
            const userEmail = res.data?.email ?? this.email?.value;

            this.signUpResponseStorage.setUser(userId ?? '', userEmail, true);

            const msg = this.translate.instant('SIGNUP.MESSAGES.SUCCESS_DETAIL', {
              email: userEmail,
            });
            this.toast.success(msg);
            this.router.navigate([ROUTES.confirmEmail]);
          } else {
            const errorKey = this.facade.mapError(res);
            this.toast.error(this.translate.instant(errorKey));
          }
        },
        error: (err) => {
          const errorKey = this.facade.mapError(err);
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

    if (control.errors['invalidUSPhone']) {
      return this.translate.instant('SIGNUP.ERRORS.US_PHONE_PATTERN');
    }
    if (control.errors['invalidPhone']) {
      return this.translate.instant('SIGNUP.ERRORS.PHONE_PATTERN');
    }

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'name':
          return this.translate.instant('SIGNUP.ERRORS.FULLNAME_PATTERN');
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
