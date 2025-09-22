import { Component, signal, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@shared/components/button/button.component';
import { REG_EXP } from '@shared/config/constants';
import { InputComponent } from '@shared/components/inputs/input/input.component';

@Component({
  selector: 'app-new-password',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonComponent,
    MatIconModule,
    TranslateModule,
    InputComponent,
  ],
  templateUrl: './new-password.html',
  styleUrl: './new-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPassword {
  // Inputs from parent component
  userId = input<string>('');
  otpCode = input<string>('');
  isLoading = input<boolean>(false);
  // Outputs to parent component
  passwordSubmitted = output<{ newPassword: string; confirmPassword: string }>();
  goBack = output<void>();

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  newPasswordForm = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.pattern(REG_EXP.PASSWORD)]),
    confirmPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(REG_EXP.PASSWORD),
    ]),
  });

  get newPassword() {
    return this.newPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.newPasswordForm.get('confirmPassword');
  }

  onSubmit() {
    if (this.newPasswordForm.invalid) {
      this.newPasswordForm.markAllAsTouched();
      return;
    }

    const newPassword = this.newPasswordForm.get('newPassword')?.value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword')?.value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      this.newPasswordForm.setErrors({ mismatch: true });
    }

    // Emit the password data to parent component
    this.passwordSubmitted.emit({
      newPassword: newPassword || '',
      confirmPassword: confirmPassword || '',
    });
  }

  onGoBack() {
    this.goBack.emit();
  }

  toggleShowPassword() {
    this.showPassword.set(!this.showPassword());
  }
  toggleShowConfirmPassword() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  getFieldError(fieldName: string) {
    const field = this.newPasswordForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['pattern']) {
        return `${fieldName} must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number`;
      }
    }
    return '';
  }
}
