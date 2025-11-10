import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { COUNTRIES } from '@shared/config/constants';
import { Observable, of, tap, catchError, finalize } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { ProfileFacadeService } from './services/profile-facade.service';

@Component({
  selector: 'app-complete-profile',
  imports: [TranslateModule, Navbar, Footer, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss',
})
export class CompleteProfile implements OnInit, OnChanges, OnDestroy {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['completeProfileForm']) {
      this.isDataCompleted = this.completeProfileForm.valid;
    }
  }

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // form
  completeProfileForm: FormGroup;
  isDataCompleted: boolean = false;
  profilePic: string | undefined;
  isLoading: boolean = false;

  // Phone-specific
  countries = COUNTRIES;
  selectedCountry = this.countries[0];
  isOpen = false;
  phoneInputNumber: string = '';
  disabled = false;

  profileImageFile: File | null = null;

  isLoadingProfile: boolean = false;
  user: any | null = null;

  // Birth Date Inputs
  @ViewChild('birthMonthInput') birthMonthInput!: ElementRef<HTMLInputElement>;
  @ViewChild('birthDayInput') birthDayInput!: ElementRef<HTMLInputElement>;
  @ViewChild('birthYearInput') birthYearInput!: ElementRef<HTMLInputElement>;

  genders = [
    { value: 'male', labelKey: 'complete-profile.form.gender-male' },
    { value: 'female', labelKey: 'complete-profile.form.gender-female' },
  ];

  // Address
  allAddressCountries: any[] = [];
  addressCountries$!: Observable<any[]>;
  availableStates: any[] = [];
  statesLoading: boolean = false;
  countriesLoading: boolean = false;

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.phone-dropdown-wrapper');
    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  constructor(
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private profileFacadeService: ProfileFacadeService,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {
    this.completeProfileForm = this.formBuilder.group({
      fullLegalName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
          Validators.pattern(/^[\p{L}\s'-]+$/u),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      gender: [null, [Validators.required]],
      phoneNumber: ['', [Validators.required, this.phoneFormatValidator.bind(this)]],
      nationalId: ['', [Validators.required]],
      birthMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      birthDay: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      birthYear: [
        '',
        [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())],
      ],
      country: [null, [Validators.required]],
      state: [{ value: null, disabled: true }, [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
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
    const phoneControl = this.completeProfileForm.get('phoneNumber');
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

  get fullLegalName() {
    return this.completeProfileForm.get('fullLegalName');
  }
  get email() {
    return this.completeProfileForm.get('email');
  }
  get gender() {
    return this.completeProfileForm.get('gender');
  }
  get phoneNumber() {
    return this.completeProfileForm.get('phoneNumber');
  }
  get nationalId() {
    return this.completeProfileForm.get('nationalId');
  }
  get birthMonth() {
    return this.completeProfileForm.get('birthMonth');
  }
  get birthDay() {
    return this.completeProfileForm.get('birthDay');
  }
  get birthYear() {
    return this.completeProfileForm.get('birthYear');
  }
  get country() {
    return this.completeProfileForm.get('country');
  }
  get state() {
    return this.completeProfileForm.get('state');
  }
  get postalCode() {
    return this.completeProfileForm.get('postalCode');
  }

  getErrorMessageFor(controlName: string): string {
    const control = this.completeProfileForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required'])
      return this.translateService.instant('complete-profile.form.error.required');

    if (control.errors['minlength']) {
      return this.translateService.instant('complete-profile.form.error.minlength', {
        requiredLength: control.errors['minlength'].requiredLength,
      });
    }

    if (control.errors['maxlength']) {
      return this.translateService.instant('complete-profile.form.error.maxlength', {
        requiredLength: control.errors['maxlength'].requiredLength,
      });
    }

    if (control.errors['email'])
      return this.translateService.instant('complete-profile.form.error.email');

    // Add phone validation errors from your AppointmentServiceComponent
    if (control.errors['invalidUSPhone']) {
      return this.translateService.instant('SIGNUP.ERRORS.US_PHONE_PATTERN');
    }
    if (control.errors['invalidPhone']) {
      return this.translateService.instant('SIGNUP.ERRORS.PHONE_PATTERN');
    }

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'fullLegalName':
          return this.translateService.instant('complete-profile.form.error.fullname_pattern');
        case 'email':
          return this.translateService.instant('complete-profile.form.error.email');
        case 'nationalId':
          return this.translateService.instant('complete-profile.form.error.national_id');
        case 'birthMonth':
          return this.translateService.instant('complete-profile.form.error.birth_month');
        case 'birthDay':
          return this.translateService.instant('complete-profile.form.error.birth_day');
        case 'birthYear':
          return this.translateService.instant('complete-profile.form.error.birth_year');
        case 'country':
          return this.translateService.instant('complete-profile.form.error.country');
        case 'state':
          return this.translateService.instant('complete-profile.form.error.state');
        case 'postalCode':
          return this.translateService.instant('complete-profile.form.error.postal_code');
      }
    }

    // Handle custom validation errors
    if (control.errors['invalidMonth'])
      return this.translateService.instant('complete-profile.form.error.birth_month');
    if (control.errors['invalidDay'])
      return this.translateService.instant('complete-profile.form.error.birth_day');
    if (control.errors['invalidYear'])
      return this.translateService.instant('complete-profile.form.error.birth_year');

    return this.translateService.instant('complete-profile.form.error.invalid');
  }

  ngOnInit() {
    this.initializeTranslation();
    this.loadAddressCountries();

    this.completeProfileForm.get('country')?.valueChanges.subscribe((countryId) => {
      this.onCountryChange(countryId);
    });

    this.completeProfileForm.get('phoneNumber')?.valueChanges.subscribe((value) => {
      this.syncPhoneInput(value);
    });
  }

  loadAddressCountries() {
    this.countriesLoading = true;
    this.cdr.detectChanges();

    this.addressCountries$ = this.profileFacadeService.getCountries().pipe(
      tap((countries) => {
        console.log('Countries loaded:', countries?.length);
        this.allAddressCountries = countries || [];
        this.countriesLoading = false;

        this.loadProfile();

        this.cdr.detectChanges();
      }),
      catchError((err) => {
        console.error('Error loading countries', err);
        this.countriesLoading = false;
        this.cdr.detectChanges();
        const msg = this.translateService.instant('complete-profile.messages.load_countries_error');
        this.toastService.error(msg);
        return of([]);
      })
    );
  }

  loadProfile() {
    this.isLoadingProfile = true;
    this.profileFacadeService.getProfile().subscribe({
      next: (response) => {
        if (response && response.succeeded && response.data) {
          console.log('Profile loaded:', response.data);

          this.user = response.data;

          this.patchForm(response.data);
        } else {
          throw new Error('Profile data not found in response');
        }
        this.isLoadingProfile = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading profile', err);
        this.isLoadingProfile = false;
        const msg = this.translateService.instant('complete-profile.messages.load_profile_error');
        this.toastService.error(msg);
        this.cdr.detectChanges();
      },
    });
  }

  private patchForm(profile: any) {
    this.completeProfileForm.patchValue(
      {
        fullLegalName: profile.fullName,
        email: profile.email,
        gender: profile.gender?.toLowerCase(),
        nationalId: profile.nationalId,
        postalCode: profile.postalCode,
      },
      { emitEvent: false }
    );

    this.profilePic = profile.profileImageUrl;

    if (profile.dateOfBirth) {
      const dateParts = profile.dateOfBirth.split('T')[0].split('-');
      if (dateParts.length === 3) {
        this.completeProfileForm.patchValue(
          {
            birthYear: dateParts[0],
            birthMonth: dateParts[1],
            birthDay: dateParts[2],
          },
          { emitEvent: false }
        );
      }
    }

    this.completeProfileForm.get('phoneNumber')?.setValue(profile.phoneNumber);

    const countryName = profile.country;
    const stateName = profile.state;

    const foundCountry = this.allAddressCountries.find(
      (c) => c.name.toLowerCase() === countryName?.toLowerCase()
    );

    if (foundCountry) {
      this.completeProfileForm.get('country')?.setValue(foundCountry.id);

      this.statesLoading = true;
      this.profileFacadeService.getStatesByCountry(foundCountry.id).subscribe((states) => {
        this.availableStates = states || [];

        const foundState = this.availableStates.find(
          (s) => s.name.toLowerCase() === stateName?.toLowerCase()
        );

        if (foundState) {
          this.completeProfileForm.get('state')?.setValue(foundState.id);
        }

        this.completeProfileForm.get('state')?.enable();
        this.statesLoading = false;

        this.isDataCompleted = this.completeProfileForm.valid;
        this.syncPhoneInput(this.completeProfileForm.get('phoneNumber')?.value);
        this.cdr.detectChanges();
      });
    } else {
      console.warn(`Could not find a matching ID for country: ${countryName}`);
      this.isDataCompleted = this.completeProfileForm.valid;
      this.syncPhoneInput(this.completeProfileForm.get('phoneNumber')?.value);
      this.cdr.detectChanges();
    }
  }

  onCountryChange(countryId: number | null) {
    const stateControl = this.completeProfileForm.get('state');

    // Reset state when country changes
    stateControl?.setValue(null);
    stateControl?.markAsUntouched();
    this.availableStates = [];

    if (countryId) {
      this.statesLoading = true;
      stateControl?.disable();
      this.cdr.detectChanges(); // Trigger change detection

      this.profileFacadeService
        .getStatesByCountry(countryId)
        .pipe(
          finalize(() => {
            this.statesLoading = false;
            this.cdr.detectChanges(); // Trigger change detection when loading completes
          })
        )
        .subscribe({
          next: (states) => {
            console.log('States loaded:', states?.length);
            this.availableStates = states || [];
            if (this.availableStates.length > 0) {
              stateControl?.enable();
            } else {
              stateControl?.disable();
              stateControl?.clearValidators();
              stateControl?.updateValueAndValidity();
            }
            this.cdr.detectChanges(); // Trigger change detection after states are set
          },
          error: (err) => {
            console.error('Error loading states', err);
            this.availableStates = [];
            stateControl?.disable();
            this.cdr.detectChanges(); // Trigger change detection on error
          },
        });
    } else {
      this.availableStates = [];
      stateControl?.disable();
      this.cdr.detectChanges(); // Trigger change detection
    }
  }

  // Initialize translation
  private initializeTranslation() {
    // Set default language if not already set
    if (!localStorage.getItem('servabest-language')) {
      localStorage.setItem('servabest-language', 'en');
    }

    // Get saved language and set it
    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);
    if (savedLang === 'en' || savedLang === 'sp') {
      document.documentElement.style.direction = 'ltr';
    } else if (savedLang === 'ar') {
      document.documentElement.style.direction = 'rtl';
    }

    // Set initial language state
    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';
    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic = event.lang === 'ar';
      this.isEnglish = event.lang === 'en';
      this.isSpanish = event.lang === 'sp';
    });
  }

  syncPhoneInput(value: string | null) {
    if (!value) {
      this.phoneInputNumber = '';
      return;
    }

    const match = this.countries.find((c) => value.startsWith(c.dialCode));

    if (match) {
      this.selectedCountry = match;
      this.phoneInputNumber = value.slice(match.dialCode.length);
    } else {
      this.phoneInputNumber = value.replace(/\D/g, '');
    }
  }

  onUploadProfilePic() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.profileImageFile = file;
        this.profilePic = URL.createObjectURL(file);
        this.cdr.detectChanges();
      }
    };
  }

  // --- Phone logic ---
  toggleDropdown(event?: MouseEvent) {
    event?.stopPropagation();
    if (!this.disabled) this.isOpen = !this.isOpen;
  }

  selectCountry(c: any) {
    if (this.disabled) return;
    this.selectedCountry = c;
    this.isOpen = false;
    this.updateFullPhoneNumber();
    this.completeProfileForm.get('phoneNumber')?.markAsTouched();
  }

  updateFullPhoneNumber() {
    const fullNumber = `${this.selectedCountry.dialCode}${this.phoneInputNumber}`;
    this.completeProfileForm.get('phoneNumber')?.setValue(fullNumber);
  }

  onNumberChange(newValue: string) {
    if (this.disabled) return;
    this.phoneInputNumber = newValue.replace(/\D/g, '');
    this.updateFullPhoneNumber();
  }

  checkTouched(controlName: string) {
    return !!this.completeProfileForm.get(controlName)?.invalid;
  }

  checkInvalid(controlName: string) {
    return !!(
      this.completeProfileForm.get(controlName)?.invalid &&
      this.completeProfileForm.get(controlName)?.touched
    );
  }

  // Birth Date Methods
  onBirthDateInput(type: 'month' | 'day' | 'year', event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Auto-advance to next field
    if (value.length === this.getMaxLength(type) && type !== 'year') {
      const nextField = this.getNextField(type);
      if (nextField) {
        nextField.focus();
      }
    }

    // Validate as user types
    this.validateBirthDateField(type, value);
  }

  onBirthDateKeydown(type: 'month' | 'day' | 'year', event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Allow navigation with arrow keys
    if (['ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      return;
    }

    // Handle backspace
    if (event.key === 'Backspace' && input.value === '') {
      const prevField = this.getPrevField(type);
      if (prevField) {
        prevField.focus();
      }
    }

    // Allow only numbers and control keys
    if (
      !/^\d$/.test(event.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  onBirthDateFocus(type: 'month' | 'day' | 'year') {
    const control = this.completeProfileForm.get(this.getControlName(type));
    if (control) {
      control.markAsTouched();
    }
  }

  onBirthDateBlur(type: 'month' | 'day' | 'year') {
    const control = this.completeProfileForm.get(this.getControlName(type));
    const value = control?.value;

    if (value) {
      // Pad with leading zero if needed
      if (type !== 'year' && value.length === 1) {
        control.setValue(value.padStart(2, '0'));
      }

      // Validate the field
      this.validateBirthDateField(type, value);
    }
  }

  // Helper methods
  private getControlName(type: 'month' | 'day' | 'year'): string {
    return `birth${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  private getMaxLength(type: 'month' | 'day' | 'year'): number {
    return type === 'year' ? 4 : 2;
  }

  private getNextField(type: 'month' | 'day' | 'year'): HTMLInputElement | null {
    const fields: Record<'month' | 'day' | 'year', HTMLInputElement | null> = {
      month: this.birthDayInput?.nativeElement || null,
      day: this.birthYearInput?.nativeElement || null,
      year: null,
    };

    return fields[type];
  }

  private getPrevField(type: 'month' | 'day' | 'year'): HTMLInputElement | null {
    const fields: Record<'month' | 'day' | 'year', HTMLInputElement | null> = {
      month: null,
      day: this.birthMonthInput?.nativeElement || null,
      year: this.birthDayInput?.nativeElement || null,
    };

    return fields[type];
  }

  private validateBirthDateField(type: 'month' | 'day' | 'year', value: string) {
    const control = this.completeProfileForm.get(this.getControlName(type));
    if (!control || !value) return;

    const numValue = parseInt(value, 10);

    switch (type) {
      case 'month':
        if (numValue < 1 || numValue > 12) {
          control.setErrors({ invalidMonth: true });
        } else {
          // Clear errors if valid
          if (control.errors?.['invalidMonth']) {
            const errors = { ...control.errors };
            delete errors['invalidMonth'];
            control.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
        break;
      case 'day':
        const month = parseInt(this.birthMonth?.value || '1', 10);
        const year = parseInt(this.birthYear?.value || new Date().getFullYear().toString(), 10);
        const maxDays = this.getDaysInMonth(month, year);

        if (numValue < 1 || numValue > maxDays) {
          control.setErrors({ invalidDay: true });
        } else {
          // Clear errors if valid
          if (control.errors?.['invalidDay']) {
            const errors = { ...control.errors };
            delete errors['invalidDay'];
            control.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
        break;
      case 'year':
        const currentYear = new Date().getFullYear();
        if (numValue < 1900 || numValue > currentYear) {
          control.setErrors({ invalidYear: true });
        } else {
          // Clear errors if valid
          if (control.errors?.['invalidYear']) {
            const errors = { ...control.errors };
            delete errors['invalidYear'];
            control.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
        break;
    }
  }

  private getDaysInMonth(month: number, year: number): number {
    return new Date(year, month, 0).getDate();
  }

  // Combined error display for birth date
  isBirthDateInvalid(): boolean {
    const birthMonth = this.completeProfileForm.get('birthMonth');
    const birthDay = this.completeProfileForm.get('birthDay');
    const birthYear = this.completeProfileForm.get('birthYear');

    const anyInvalidAndTouched =
      (birthMonth?.invalid && birthMonth?.touched) ||
      (birthDay?.invalid && birthDay?.touched) ||
      (birthYear?.invalid && birthYear?.touched);

    const allEmpty =
      (!birthMonth?.value || birthMonth?.value === '') &&
      (!birthDay?.value || birthDay?.value === '') &&
      (!birthYear?.value || birthYear?.value === '');

    return anyInvalidAndTouched || allEmpty;
  }

  getBirthDateErrorMessage(): string {
    if (this.checkInvalid('birthMonth')) {
      return this.getErrorMessageFor('birthMonth');
    }
    if (this.checkInvalid('birthDay')) {
      return this.getErrorMessageFor('birthDay');
    }
    if (this.checkInvalid('birthYear')) {
      return this.getErrorMessageFor('birthYear');
    }
    return ' ';
  }

  checkBirthDate() {
    let birthMonth = this.completeProfileForm.get('birthMonth');
    let birthDay = this.completeProfileForm.get('birthDay');
    let birthYear = this.completeProfileForm.get('birthYear');
    if (birthMonth?.value && birthDay?.value && birthYear?.value) {
      return true;
    }
    return false;
  }

  onSubmit() {
    if (this.completeProfileForm.invalid) {
      this.completeProfileForm.markAllAsTouched();
      console.log('Form is invalid:', this.completeProfileForm.value);

      const msg = this.translateService.instant('complete-profile.messages.form_invalid');
      this.toastService.warning(msg);
      return;
    }

    this.isLoading = true;

    const formattedBirthDate = this.formatBirthDate();
    if (!formattedBirthDate) {
      console.error('Invalid birth date');
      this.isLoading = false;
      this.cdr.detectChanges();

      const msg = this.translateService.instant('complete-profile.messages.birthdate_invalid');
      this.toastService.error(msg);
      return;
    }

    const formData = this.completeProfileForm.getRawValue();

    const apiPayload = new FormData();

    // Find the string names for Country and State
    const selectedCountry = this.allAddressCountries.find((c) => c.id == formData.country);
    const selectedState = this.availableStates.find((s) => s.id == formData.state);

    apiPayload.append('FullName', formData.fullLegalName);
    apiPayload.append('Email', formData.email);
    apiPayload.append('Gender', formData.gender);
    apiPayload.append('PhoneNumber', formData.phoneNumber);
    apiPayload.append('NationalId', formData.nationalId);
    apiPayload.append('DateOfBirth', formattedBirthDate);
    apiPayload.append('PostalCode', formData.postalCode);

    // Use the string names, not the IDs
    apiPayload.append('Country', selectedCountry ? selectedCountry.name : '');
    apiPayload.append('State', selectedState ? selectedState.name : '');
    apiPayload.append('UserName', formData.email);

    if (this.profileImageFile) {
      apiPayload.append('ProfileImage', this.profileImageFile, this.profileImageFile.name);
    } else {
      apiPayload.append('ProfileImage', '');
    }

    console.log('Submitting API payload:', apiPayload);

    this.profileFacadeService.completeProfile(apiPayload).subscribe({
      next: (response) => {
        console.log('Profile update successful', response);
        this.isDataCompleted = true;
        this.cdr.detectChanges();

        this.isLoading = false;

        const successMsg = this.translateService.instant(
          'complete-profile.messages.update_success'
        );
        this.toastService.success(successMsg, 3000);

        const oldUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const updatedUserData = {
          ...oldUserData,
          email: response.data.email,
          fullName: response.data.fullName,
          phoneNumber: response.data.phoneNumber,
          profileImageUrl: response.data.profileImageUrl,
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUserData));

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      error: (err) => {
        console.error('Profile update failed', err);
        this.isLoading = false;
        this.cdr.detectChanges();

        const genericErrorMsg = this.translateService.instant(
          'complete-profile.messages.update_error'
        );
        const apiErrorMessage = err?.error?.message || err?.message;
        this.toastService.error(genericErrorMsg);
      },
    });
  }

  private formatBirthDate(): string | null {
    const birthMonth = this.completeProfileForm.get('birthMonth')?.value;
    const birthDay = this.completeProfileForm.get('birthDay')?.value;
    const birthYear = this.completeProfileForm.get('birthYear')?.value;

    if (!birthMonth || !birthDay || !birthYear) return null;

    const paddedMonth = birthMonth.toString().padStart(2, '0');
    const paddedDay = birthDay.toString().padStart(2, '0');

    // ISO format YYYY-MM-DD
    return `${birthYear}-${paddedMonth}-${paddedDay}`;
  }

  ngOnDestroy() {}
}
