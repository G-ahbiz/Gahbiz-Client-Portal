import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Rating } from '@shared/components/rating/rating';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  GetReviewsParams,
  SortColumn,
  DEFAULT_REVIEWS_PARAMS,
} from '@features/all-services/interfaces/services-details/reviews-tab/get-reviews-params';
import { CreateReviewRequest } from '@features/all-services/interfaces/services-details/reviews-tab/create-review-request';
import { ToastService } from '@shared/services/toast.service';
import { ServicesDetailsFacadeService } from '@features/all-services/services/services-details/services-details-facade.service';
import { PrimengFixService } from '@shared/services/primeng-fix.service';
import { User } from '@features/auth/interfaces/sign-in/user';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

// Custom validator for rating
function ratingValidator(control: AbstractControl) {
  const value = control.value;
  return value && value >= 1 && value <= 5 ? null : { invalidRating: true };
}

@Component({
  selector: 'app-reviews-tab',
  standalone: true,
  imports: [
    CommonModule,
    Rating,
    FormsModule,
    ReactiveFormsModule,
    RatingModule,
    TranslateModule,
    DatePipe,
  ],
  templateUrl: './reviews-tab.html',
  styleUrl: './reviews-tab.scss',
})
export class ReviewsTab implements AfterViewInit, OnDestroy, OnInit {
  // --- ServiceId with enhanced validation ---
  private _serviceId = '';
  @Input()
  set serviceId(value: string | { id?: string } | null | undefined) {
    const raw = this.extractServiceId(value);
    const forbidden = ['', 'undefined', 'null', 'set serviceid', '0'];

    if (!raw || forbidden.includes(raw.toLowerCase())) {
      console.warn('[ReviewsTab] Ignored invalid serviceId:', value);
      return;
    }

    if (raw === this._serviceId) return;

    this._serviceId = raw;
    console.debug('[ReviewsTab] serviceId set:', this._serviceId);

    // Reset state and load reviews
    this.facade.resetState();
    this.currentParams.set({ ...DEFAULT_REVIEWS_PARAMS, pageSize: 4 });
    this.loadReviews();
  }
  get serviceId(): string {
    return this._serviceId;
  }

  private extractServiceId(value: any): string {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
      return (value.id || value.serviceId || value._id || '').toString().trim();
    }
    return (value?.toString() || '').trim();
  }

  // --- Injected Services ---
  private fb = inject(FormBuilder);
  private facade = inject(ServicesDetailsFacadeService);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
  private cd = inject(ChangeDetectorRef);
  private el = inject(ElementRef);
  private primengFix = inject(PrimengFixService);
  private authService = inject(AuthService);

  // --- Component State ---
  private destroy$ = new Subject<void>();
  reviewsForm: FormGroup;
  currentSort = signal<SortColumn>('Newest');
  currentParams = signal<GetReviewsParams>({ ...DEFAULT_REVIEWS_PARAMS, pageSize: 4 });
  formSubmitted = signal(false);
  isSubmitting = signal(false);
  isUserLoggedIn = signal(false);

  // --- Signals from Facade ---
  rating = this.facade.averageRating;
  ratingDistribution = this.facade.ratingDistribution;
  totalReviews = this.facade.totalReviews;
  reviewsList = this.facade.reviewsList;
  isLoading = this.facade.isLoading;
  error = this.facade.error;
  pagination = this.facade.pagination;

  private resizeListener?: () => void;

  constructor() {
    this.reviewsForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if user is logged in and populate form
    this.checkUserAuthentication();

    // Debounce form validation for better performance
    this.reviewsForm.statusChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.cd.markForCheck();
      });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          this.noWhitespaceValidator,
        ],
      ],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      comment: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
          this.noWhitespaceValidator,
        ],
      ],
      rating: [0, [Validators.required, ratingValidator]],
    });
  }

  /**
   * Check if user is authenticated and populate form fields
   */
  private checkUserAuthentication(): void {
    this.authService.waitForInitialization().subscribe(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      this.isUserLoggedIn.set(isAuthenticated);

      if (isAuthenticated) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.populateUserData(currentUser);
        }
      }
    });

    // Also listen to auth state changes
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | null) => {
      const isLoggedIn = !!user;
      this.isUserLoggedIn.set(isLoggedIn);

      if (isLoggedIn && user) {
        this.populateUserData(user);
      } else {
        // Clear form if user logs out
        this.clearUserData();
      }
    });
  }

  /**
   * Populate form with user data
   */
  private populateUserData(user: User): void {
    // Use the user's full name
    const userName = user.fullName;
    const userEmail = user.email || '';

    // Only populate if fields are empty or contain default values
    const currentName = this.reviewsForm.get('name')?.value;
    const currentEmail = this.reviewsForm.get('email')?.value;

    if ((!currentName || currentName === '') && userName) {
      this.reviewsForm.patchValue({ name: userName });
    }

    if ((!currentEmail || currentEmail === '') && userEmail) {
      this.reviewsForm.patchValue({ email: userEmail });
    }

    // Mark fields as touched to show validation state
    this.reviewsForm.get('name')?.markAsTouched();
    this.reviewsForm.get('email')?.markAsTouched();

    this.cd.detectChanges();
  }

  /**
   * Clear user data from form
   */
  private clearUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userName = currentUser.fullName;
      const userEmail = currentUser.email || '';

      const currentName = this.reviewsForm.get('name')?.value;
      const currentEmail = this.reviewsForm.get('email')?.value;

      if (currentName === userName) {
        this.reviewsForm.patchValue({ name: '' });
      }
      if (currentEmail === userEmail) {
        this.reviewsForm.patchValue({ email: '' });
      }
    } else {
      // If no current user, clear the fields
      this.reviewsForm.patchValue({ name: '', email: '' });
    }

    this.cd.detectChanges();
  }

  // Custom validator to prevent only whitespace
  private noWhitespaceValidator(control: AbstractControl) {
    if (control.value && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  // --- Rest of your existing methods remain the same ---
  ngAfterViewInit(): void {
    this.initializePrimeNGComponents();
    this.resizeListener = this.primengFix.fixPrimeNGComponents.bind(
      this.primengFix,
      this.el.nativeElement
    );
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private initializePrimeNGComponents(): void {
    this.primengFix.fixRatingComponents(this.el.nativeElement);
    setTimeout(() => {
      this.cd.detectChanges();
      this.primengFix.fixPrimeNGComponents(this.el.nativeElement);
    }, 300);
  }

  // --- Data Loading ---
  private loadReviews(): void {
    if (!this.isValidServiceId()) {
      console.warn('[ReviewsTab] Skipping loadReviews, invalid serviceId:', this._serviceId);
      return;
    }

    const params: GetReviewsParams = {
      ...this.currentParams(),
      sortColumn: this.currentSort(),
      sortDirection: this.getSortDirection(this.currentSort()),
    };

    this.facade.loadReviews(this._serviceId, params).subscribe({
      error: (err) => {
        console.error('Load reviews error in component', err);
      },
    });
  }

  private isValidServiceId(): boolean {
    return (
      !!this._serviceId &&
      this._serviceId !== 'undefined' &&
      this._serviceId !== 'null' &&
      this._serviceId.length > 0
    );
  }

  private getSortDirection(sortColumn: SortColumn): 'ASC' | 'DESC' {
    switch (sortColumn) {
      case 'Oldest':
        return 'ASC';
      case 'LowestRating':
        return 'ASC';
      default:
        return 'DESC';
    }
  }

  // --- Template Helpers ---
  getRatingPercentage(index: number): number {
    const total = this.totalReviews();
    if (total === 0) return 0;
    const count = this.ratingDistribution()[index] ?? 0;
    return (count / total) * 100;
  }

  // Form field helpers for template
  get nameField() {
    return this.reviewsForm.get('name');
  }
  get emailField() {
    return this.reviewsForm.get('email');
  }
  get commentField() {
    return this.reviewsForm.get('comment');
  }
  get ratingField() {
    return this.reviewsForm.get('rating');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewsForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || this.formSubmitted()));
  }

  getFieldError(fieldName: string): string {
    const field = this.reviewsForm.get(fieldName);
    if (!field || !field.errors || !(field.touched || this.formSubmitted())) return '';

    const errors = field.errors;

    if (errors['required']) return this.translate.instant('VALIDATION.REQUIRED');
    if (errors['email']) return this.translate.instant('VALIDATION.EMAIL');
    if (errors['minlength'])
      return this.translate.instant('VALIDATION.MIN_LENGTH', {
        requiredLength: errors['minlength'].requiredLength,
      });
    if (errors['maxlength'])
      return this.translate.instant('VALIDATION.MAX_LENGTH', {
        requiredLength: errors['maxlength'].requiredLength,
      });
    if (errors['whitespace']) return this.translate.instant('VALIDATION.WHITESPACE');
    if (errors['invalidRating']) return this.translate.instant('VALIDATION.RATING');

    return this.translate.instant('VALIDATION.INVALID');
  }

  getRemainingCharacters(): number {
    const commentControl = this.reviewsForm.get('comment');
    const commentValue = commentControl?.value || '';
    return 1000 - commentValue.length;
  }

  // --- Event Handlers ---
  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortColumn;
    const validSorts: SortColumn[] = ['Newest', 'Oldest', 'HighestRating', 'LowestRating'];
    const sortColumn = validSorts.includes(value) ? value : 'Newest';

    this.currentSort.set(sortColumn);
    this.currentParams.update((p) => ({ ...p, pageNumber: 1 }));
    this.loadReviews();
  }

  onViewMore(): void {
    if (this.isLoading() || !this.pagination()?.hasNextPage) return;

    this.currentParams.update((p) => ({
      ...p,
      pageNumber: (p.pageNumber ?? 1) + 1,
    }));
    this.loadReviews();
  }

  onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.reviewsForm.invalid) {
      this.markFormGroupTouched(this.reviewsForm);
      this.scrollToFirstInvalidField();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.reviewsForm.value;
    const dto: CreateReviewRequest = {
      serviceId: this._serviceId,
      rating: formValue.rating,
      comment: formValue.comment.trim(),
      name: formValue.name.trim(),
      email: formValue.email.trim(),
    };

    this.facade.postReview(dto).subscribe({
      next: () => {
        this.reviewsForm.reset();
        this.reviewsForm.patchValue({ rating: 0 });
        this.formSubmitted.set(false);
        this.isSubmitting.set(false);

        // After reset, repopulate with user data if logged in
        if (this.isUserLoggedIn()) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.populateUserData(currentUser);
          }
        }

        // Reset to first page to see new review
        this.currentParams.set({ ...this.currentParams(), pageNumber: 1 });

        setTimeout(() => {
          this.primengFix.fixRatingComponents(this.el.nativeElement);
          this.scrollToReviewsList();
        }, 100);
      },
      error: () => {
        this.isSubmitting.set(false);
      },
    });
  }

  onRetry(): void {
    this.facade.clearError();
    this.loadReviews();
  }

  // --- Helper Methods ---
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private scrollToFirstInvalidField(): void {
    const firstInvalidElement = this.el.nativeElement.querySelector('.ng-invalid');
    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      firstInvalidElement.focus();
    }
  }

  private scrollToReviewsList(): void {
    const reviewsList = this.el.nativeElement.querySelector('.reviews-list-container');
    if (reviewsList) {
      reviewsList.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // --- TrackBy Functions for Performance ---
  trackByReviewId(index: number, review: any): string {
    return review.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
