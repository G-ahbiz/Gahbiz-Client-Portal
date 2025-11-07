import {
  ChangeDetectionStrategy,
  Component,
  model,
  OnInit,
  OnDestroy,
  signal,
  inject,
  ChangeDetectorRef,
  ViewChild,
  computed,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AllServicesComponentService } from '@shared/services/all-services-component';
import { MenuItem } from 'primeng/api';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { Router, RouterLink } from '@angular/router';
import { InputComponent } from '@shared/components/input/input.component';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { AppointmentFacadeService } from '../services/appointment/appointment-facade.service';
import { Branch } from '../interfaces/branch';
import { Subject } from 'rxjs';
import { AvailableSlotsResponse } from '../interfaces/appointment/available-slots-response';
import { BookRequest } from '../interfaces/appointment/book-request';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';
import { BestOffers } from '@features/landingpage/components/best-offers/best-offers';

interface BreadcrumbItem {
  label: string;
  isActive?: boolean;
  command?: () => void;
}

@Component({
  selector: 'app-appointment-service-component',
  imports: [
    CommonModule,
    TranslateModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatDatepickerModule,
    BestOffers,
    Navbar,
    Footer,
    InputComponent,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './appointment-service-component.html',
  styleUrl: './appointment-service-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
})
export class AppointmentServiceComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  // Services
  private readonly appointmentFacadeService = inject(AppointmentFacadeService);
  private readonly translateService = inject(TranslateService);
  private readonly allServicesService = inject(AllServicesComponentService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);

  // Language
  readonly currentLang = computed(() => this.translateService.currentLang);
  readonly isRTL = computed(() => this.currentLang() === 'ar');

  // Mobile calendar state
  readonly showMobileCalendar = signal(false);

  // Breadcrumb
  readonly breadcrumbItems = signal<BreadcrumbItem[]>([]);
  readonly home = signal<MenuItem | undefined>(undefined);

  // Appointment data
  readonly selected = model<Date | null>(null);
  readonly branches = signal<Branch[]>([]);
  readonly availableSlots = signal<AvailableSlotsResponse>({});
  readonly availableDatesSet = signal<Set<string>>(new Set());
  readonly availableTimes = signal<string[]>([]);

  // Loading states
  readonly isLoading = signal(false);
  readonly isBooking = signal(false);

  appointmentServiceForm: FormGroup;

  constructor() {
    this.appointmentServiceForm = this.createForm();
  }

  ngOnInit(): void {
    this.initializeTranslation();
    this.initializeHomeBreadcrumb();
    this.updateBreadcrumb();
    this.loadBranches();
    this.setupFormListeners();
    this.subscribeToAuthUser();
  }

  private subscribeToAuthUser(): void {
    this.authService
      .waitForInitialization()
      .pipe(
        switchMap(() => this.authService.currentUser$),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        if (!user) {
          // logged out → clear
          this.appointmentServiceForm.patchValue({ firstName: '', lastName: '', email: '', phone: '' });
          return;
        }

        // handle full name
        const fullName = (user.fullName ?? '').trim();
        let firstName = '';
        let lastName = '';

        if (fullName) {
          const parts = fullName.split(/\s+/);
          firstName = parts.shift() ?? '';
          lastName = parts.join(' ');
        }

        const email = user.email ?? '';

        const phone = user.phoneNumber ?? '';

        this.appointmentServiceForm.patchValue({
          firstName,
          lastName,
          email,
          phone
        });

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.allServicesService.clearActiveServiceList();
  }

  private createForm(): FormGroup {
    return this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\u0600-\u06FF\s]+$/),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+[1-9]\d{6,14}$/)]],
      location: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: [{ value: '', disabled: true }, [Validators.required]],
      duration: ['30', [Validators.required]],
    });
  }

  private initializeHomeBreadcrumb(): void {
    this.home.set({
      icon: 'pi pi-home',
      command: () => this.router.navigate(['/home']),
    });
  }

  private initializeTranslation(): void {
    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);

    this.updateDocumentDirection(savedLang);

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: LangChangeEvent) => {
        this.updateDocumentDirection(event.lang);
        this.updateBreadcrumb();
      });
  }

  private updateDocumentDirection(lang: string): void {
    document.documentElement.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
  }

  private loadBranches(): void {
    this.isLoading.set(true);

    this.appointmentFacadeService
      .getBranches()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (branches) => {
          this.branches.set(branches);
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  private updateAvailableDatesSet(slots: AvailableSlotsResponse): void {
    const dates = Object.keys(slots);
    this.availableDatesSet.set(new Set(dates));
  }

  private setupFormListeners(): void {
    // Date selection listener
    this.appointmentServiceForm
      .get('date')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((selectedDate) => {
        this.onDateSelected(selectedDate);
      });

    // Location change listener with debounce
    this.appointmentServiceForm
      .get('location')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((branchId) => {
        this.onLocationChanged(branchId);
      });
  }

  private onLocationChanged(branchId: string): void {
    if (branchId) {
      this.loadAvailableSlotsForLocation(branchId);
    } else {
      this.resetAvailableSlots();
    }
  }

  private resetAvailableSlots(): void {
    this.availableSlots.set({});
    this.availableDatesSet.set(new Set());
    this.availableTimes.set([]);
    this.appointmentServiceForm.get('date')?.setValue('');
    this.appointmentServiceForm.get('time')?.setValue('');
  }

  private onDateSelected(selectedDate: string): void {
    const timeControl = this.appointmentServiceForm.get('time');

    if (!selectedDate) {
      this.availableTimes.set([]);
      timeControl?.disable();
      timeControl?.setValue('');
      return;
    }

    const slots = this.availableSlots();
    const times = slots[selectedDate] || [];
    const formattedTimes = times.map((time) => this.formatTimeForDisplay(time));
    this.availableTimes.set(formattedTimes);

    if (formattedTimes.length > 0) {
      timeControl?.enable();

      if (formattedTimes.length === 1) {
        timeControl?.setValue(formattedTimes[0]);
      }
    } else {
      timeControl?.disable();
      timeControl?.setValue('');
    }
  }

  private formatTimeForDisplay(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${period}`;
  }

  private loadAvailableSlotsForLocation(branchId: string): void {
    this.isLoading.set(true);

    this.appointmentFacadeService
      .getAvailableSlots(branchId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (slots) => {
          this.availableSlots.set(slots);
          this.updateAvailableDatesSet(slots);
          this.resetTimeSelection();
          this.refreshCalendar();
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoading.set(false);
          this.cdr.markForCheck();
        },
      });
  }

  private resetTimeSelection(): void {
    this.appointmentServiceForm.get('date')?.setValue('');
    this.appointmentServiceForm.get('time')?.setValue('');
    this.availableTimes.set([]);
  }

  private updateBreadcrumb(): void {
    const breadcrumbItems: BreadcrumbItem[] = this.buildBreadcrumbItems();
    this.breadcrumbItems.set(breadcrumbItems);
  }

  private buildBreadcrumbItems(): BreadcrumbItem[] {
    return [this.createServicesBreadcrumbItem(), this.createAppointmentBreadcrumbItem()];
  }

  private createServicesBreadcrumbItem(): BreadcrumbItem {
    const label = this.translateService.instant('BREADCRUMB.SERVICES') || 'Our Services';
    return {
      label,
      isActive: false,
      command: () => this.navigateToAllServices(),
    };
  }

  private createAppointmentBreadcrumbItem(): BreadcrumbItem {
    const label = this.translateService.instant('appointment-service.title') || 'Appointment';
    return {
      label,
      isActive: true,
    };
  }

  private navigateToAllServices(): void {
    this.router.navigate(['/all-services']);
  }

  getErrorMessageFor(controlName: string): string {
    const control = this.appointmentServiceForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return this.translate.instant('SIGNUP.ERRORS.REQUIRED');
    if (errors['email']) return this.translate.instant('SIGNUP.ERRORS.EMAIL');
    if (errors['minlength']) {
      return this.translate.instant('SIGNUP.ERRORS.MIN_LENGTH', {
        requiredLength: errors['minlength'].requiredLength,
      });
    }
    if (errors['maxlength']) {
      return this.translate.instant('SIGNUP.ERRORS.MAX_LENGTH', {
        requiredLength: errors['maxlength'].requiredLength,
      });
    }
    if (errors['pattern']) {
      if (controlName === 'firstName' || controlName === 'lastName') {
        return this.translate.instant('SIGNUP.ERRORS.NAME_PATTERN');
      }
    }
    if (errors['invalidPhone']) {
      return this.translate.instant('SIGNUP.ERRORS.PHONE_PATTERN');
    }

    return this.translate.instant('SIGNUP.ERRORS.INVALID');
  }

  dateClass = (date: Date): string => {
    const selectedDate = this.selected();
    const availableDates = this.availableDatesSet();
    const dateString = this.formatDateForApi(date);

    if (selectedDate && this.isSameDate(date, selectedDate)) {
      return 'selected-date';
    }

    if (availableDates.has(dateString)) {
      return 'available-date';
    }

    return 'not-available-date';
  };

  private isSameDate(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onCalendarDateSelected(date: Date | null): void {
    this.selected.set(date);
    if (date) {
      const dateString = this.formatDateForApi(date);
      this.appointmentServiceForm.get('date')?.setValue(dateString);
      this.onDateSelected(dateString);
      this.refreshCalendar();
    }
  }

  trackByBreadcrumbItem(index: number, item: BreadcrumbItem): string {
    return `${item.label}-${index}`;
  }

  onSubmit(): void {
    if (this.appointmentServiceForm.valid && !this.isBooking()) {
      this.isBooking.set(true);

      const formData = this.appointmentServiceForm.getRawValue();
      const apiTime = this.convertTimeToApiFormat(formData.time);

      const bookingDetails: BookRequest = {
        branchId: formData.location,
        date: formData.date,
        time: apiTime,
      };

      this.appointmentFacadeService
        .bookAppointment(bookingDetails)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            this.isBooking.set(false);

            if (success) {
              // SIMPLE FIX: Use page refresh instead of complex reset
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }

            this.cdr.markForCheck();
          },
          error: () => {
            this.isBooking.set(false);
            this.cdr.markForCheck();
          },
        });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.appointmentServiceForm.controls).forEach((key) => {
      const control = this.appointmentServiceForm.get(key);
      control?.markAsTouched();
    });
  }

  private convertTimeToApiFormat(displayTime: string): string {
    if (!displayTime) return '';

    try {
      const [timePart, period] = displayTime.split(' ');
      const [hours, minutes] = timePart.split(':');

      let hour = parseInt(hours, 10);

      if (period === 'PM' && hour !== 12) {
        hour += 12;
      } else if (period === 'AM' && hour === 12) {
        hour = 0;
      }

      const hourStr = hour.toString().padStart(2, '0');
      return `${hourStr}:${minutes}:00`;
    } catch (error) {
      console.error('Error converting time format:', error);
      return '';
    }
  }

  private refreshCalendar(): void {
    if (!this.calendar) return;

    const current = this.calendar.activeDate;
    const temp = new Date(current);
    temp.setMonth(current.getMonth() === 11 ? 10 : current.getMonth() + 1);

    this.calendar.activeDate = temp;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.calendar.activeDate = current;
      this.calendar.updateTodaysDate();
      this.cdr.detectChanges();
    });
  }

  // Mobile calendar methods
  toggleMobileCalendar(): void {
    this.showMobileCalendar.update((show) => !show);
  }

  hideMobileCalendar(): void {
    this.showMobileCalendar.set(false);
  }

  onMobileCalendarDateSelected(date: Date | null): void {
    this.onCalendarDateSelected(date);
    setTimeout(() => {
      this.hideMobileCalendar();
    }, 300);
  }

  // Public computed properties for template
  readonly isFormValid = computed(() => this.appointmentServiceForm.valid);
  readonly isFormLoading = computed(() => this.isLoading() || this.isBooking());
}
