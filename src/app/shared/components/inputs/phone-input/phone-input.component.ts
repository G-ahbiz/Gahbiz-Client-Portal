import { Component, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { COUNTRIES } from '../../../config/constants';
import { CommonModule } from '@angular/common';
import 'flag-icons/css/flag-icons.min.css';

let uniqueCounter = 0;

@Component({
  selector: 'app-phone-input',
  standalone: true, 
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true,
    },
  ],
})
export class PhoneInputComponent implements ControlValueAccessor {
  countries = COUNTRIES;
  selectedCountry = this.countries[0];
  phoneNumber = '';
  isOpen = false;

  @Input() label = '';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() minlength?: number;
  @Input() maxlength?: number;
  @Input() isInvalid = false;
  @Input() errorMessage = '';

  disabled = false;
  errorId = '';

  // CVA glue
  onChange = (_: any) => {};
  onTouched = () => {};

 constructor() {
    if (!this.id) {
      uniqueCounter++;
      this.id = `phone-${Date.now()}-${uniqueCounter}`;
    }
    this.errorId = `${this.id}-error`;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isOpen = false;
  }

  writeValue(value: any): void {
    if (!value) {
      this.phoneNumber = '';
      return;
    }

    // Find matching country prefix
    const match = this.countries.find((c) => value.startsWith(c.dialCode));
    if (match) {
      this.selectedCountry = match;
      this.phoneNumber = value.slice(match.dialCode.length);
    } else {
      this.phoneNumber = value;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  selectCountry(c: any) {
    if (this.disabled) return;
    this.selectedCountry = c;
    this.isOpen = false;
    this.updatePhone();
    this.onTouched();
  }

  updatePhone(): void {
    // Only digits
    this.phoneNumber = (this.phoneNumber ?? '').replace(/\D/g, '');

    // Full number with country code
    const fullNumber = `${this.selectedCountry.dialCode}${this.phoneNumber}`;

    // Push to FormControl
    this.onChange(fullNumber);
  }

  onInput(event: any) {
    if (this.disabled) return;
    this.phoneNumber = event.target.value.replace(/\D/g, '');
    this.updatePhone();
  }

  handleBlur() {
    this.onTouched();
  }
}
