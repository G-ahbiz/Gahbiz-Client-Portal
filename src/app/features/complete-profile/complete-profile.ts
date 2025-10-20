import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateModule, LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { COUNTRIES } from '@shared/config/constants';
import { CountryCodes } from '@shared/interfaces/country-codes';

@Component({
  selector: 'app-complete-profile',
  imports: [TranslateModule, Navbar, Footer, CommonModule, ReactiveFormsModule],
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.scss'
})
export class CompleteProfile implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['completeProfileForm']) {
      this.isDataCompleted = this.completeProfileForm.valid;
    }
  }


  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // phone code
  currentPhoneCode = '+1';
  phoneCodes: CountryCodes[] = [];

  // form
  completeProfileForm: FormGroup;
  isDataCompleted: boolean = false;
  profilePic: string | undefined;


  constructor(private translateService: TranslateService, private formBuilder: FormBuilder) {
    this.completeProfileForm = this.formBuilder.group({
      fullLegalName: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(60),
          Validators.pattern(/^[\p{L}\s'-]+$/u),]
      ],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      nationalId: ['', [Validators.required]],
      birthMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      birthDay: ['', [Validators.required, Validators.min(1), Validators.max(31)]],
      birthYear: ['', [Validators.required, Validators.min(1900), Validators.max(2025)]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5)]],
    });
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

    if (control.errors['required']) return this.translateService.instant('complete-profile.form.error.required');

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

    if (control.errors['email']) return this.translateService.instant('complete-profile.form.error.email');

    if (control.errors['pattern']) {
      switch (controlName) {
        case 'fullLegalName':
          return this.translateService.instant('complete-profile.form.error.fullname_pattern');
        case 'email':
          return this.translateService.instant('complete-profile.form.error.email');
        case 'phoneNumber':
          return this.translateService.instant('complete-profile.form.error.phone_pattern');
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

    return this.translateService.instant('complete-profile.form.error.invalid');
  }

  ngOnInit() {
    this.initializeTranslation();
    this.phoneCodes = COUNTRIES;
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

  onUploadProfilePic() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) {
        this.profilePic = URL.createObjectURL(file);
      }
    };
  }

  setCurrentPhoneCode(country: string) {
    this.currentPhoneCode = country;
  }


  checkTouched(controlName: string) {
    return !!(this.completeProfileForm.get(controlName)?.invalid);
  }

  checkInvalid(controlName: string) {
    return !!(this.completeProfileForm.get(controlName)?.invalid && this.completeProfileForm.get(controlName)?.touched);
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
    console.log(this.completeProfileForm.value);
  }
}
