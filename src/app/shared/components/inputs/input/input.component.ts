import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { EyePasswordComponent } from './../../eye-password/eye-password.component';

@Component({
  selector: 'app-input',
  imports: [FormsModule, EyePasswordComponent, CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() id = '';
  @Input() isInvalid = false;
  @Input() errorMessage = '';
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() pattern?: string;

  @Output() valueChange = new EventEmitter<string>();

  value = '';
  showPassword = false;

  onChange = (v: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  emitChange(value: string) {
    this.value = value;
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
