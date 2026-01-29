import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { CheckoutFacadeService } from '@features/checkout/services/checkout-facade.service';
import { environment } from '@env/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutItem } from '@features/checkout/interfaces/checkout-item';
import { ToastService } from '@shared/services/toast.service';
import { CART_ITEMS, LOCAL_STORAGE_KEYS } from '@shared/config/constants';
import { ApplyPromoCodeResponse } from '@features/checkout/interfaces/apply-pc-repsonse';
import { map } from 'rxjs';

declare global {
  interface Window {
    Accept?: any;
    bootstrap?: any;
  }
}

// Validation patterns
const VALIDATION_PATTERNS = {
  zipCode: /^\d{5}(-\d{4})?$/,
  cardNumber: /^\d{12,19}$/,
  expiry: /^(0[1-9]|1[0-2])\/\d{2}$/,
  cvv: /^\d{3,4}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  name: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
};

@Component({
  selector: 'app-step1-checkout',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './step1-checkout.html',
  styleUrl: './step1-checkout.scss',
})
export class Step1Checkout implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private facade = inject(CheckoutFacadeService);
  private cartFacade = inject(CartFacadeService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = false;
  isSubmitting = false;

  // Collapsible sections state
  isPersonalInfoCollapsed = false;
  isPaymentMethodCollapsed = false;

  promoCodeApplied = false;
  promoCodeError = '';
  promoCodeDiscount = 0;
  promoCodeSuccessMessage = '';

  private modal: any;
  private acceptScriptLoaded = false;
  private acceptReady!: Promise<void>;
  private readonly ACCEPT_SCRIPT_LOAD_TIMEOUT = 10000; // 10 seconds

  readonly CONFIG = {
    clientKey: environment.clientKey,
    apiLoginID: environment.apiLoginID,
    sandboxAcceptUrl: 'https://jstest.authorize.net/v1/Accept.js',
    productionAcceptUrl: 'https://js.authorize.net/v1/Accept.js',
  };

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy() {
    this.cleanupModal();
  }

  private initializeComponent(): void {
    const cartItems = this.cartFacade.getCart();

    if (!cartItems || cartItems.length === 0) {
      const errorMessage = this.translate.instant('checkout.cart-empty');
      this.toastService.error(errorMessage);
      this.navigateToCart();
      return;
    }

    // Check if cart contains appointment
    const hasAppointment = cartItems.some((item) => item.id === CART_ITEMS.APPOINTMENT_SERVICE);

    if (hasAppointment) {
      const metadata = localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENT_METADATA_KEY);

      // If no appointment details yet, redirect to booking
      if (!metadata) {
        this.router.navigate(['/appointment-service'], {
          queryParams: { returnToCheckout: 'true' },
        });
        return;
      }
    }

    this.initForm();
    this.loadAcceptScript().catch((error) => {
      console.error('Failed to load payment script:', error);
      const errorMessage = this.translate.instant('checkout.payment-init-failed');
      this.toastService.error(errorMessage);
    });
    this.setupFormValidation();
    this.initializeModal();
  }

  private navigateToCart(): void {
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 3000);
  }

  private initForm(): void {
    const cartItems = this.cartFacade.getCart();

    const itemControls = cartItems.map((item) =>
      this.createItemControl({
        ItemId: item.id,
        Name: item.name,
        Price: item.price || 0,
        Quantity: item.quantity || 1,
        DeliveryType: 0,
        Shipping: true,
      }),
    );

    this.form = this.fb.group({
      // Personal Info Fields
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(VALIDATION_PATTERNS.name),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(VALIDATION_PATTERNS.name),
        ],
      ],
      contactInfo: [
        '',
        [Validators.required, Validators.email, Validators.pattern(VALIDATION_PATTERNS.email)],
      ],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      city: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(VALIDATION_PATTERNS.name),
        ],
      ],
      state: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      county: ['', [Validators.maxLength(50)]],
      country: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(VALIDATION_PATTERNS.zipCode)]],

      // Promo Code
      promoCode: ['', [Validators.maxLength(20)]],

      // Payment Fields
      cardNumber: ['', [Validators.required, Validators.pattern(VALIDATION_PATTERNS.cardNumber)]],
      expMonth: [
        '',
        [
          Validators.required,
          Validators.pattern(VALIDATION_PATTERNS.expiry),
          this.expiryValidator.bind(this),
        ],
      ],
      cvv: ['', [Validators.required, Validators.pattern(VALIDATION_PATTERNS.cvv)]],

      // Items Array
      items: this.fb.array(itemControls, [Validators.required, this.minArrayLength(1)]),
    });

    // Set initial country if available
    this.setInitialCountry();
  }

  private setInitialCountry(): void {
    const userCountry = this.getUserCountry();
    if (userCountry) {
      this.form.patchValue({ country: userCountry });
    }
  }

  private getUserCountry(): string {
    // In a real app, you might get this from user profile or geolocation
    return 'US'; // Default to US
  }

  private createItemControl(item: CheckoutItem): FormGroup {
    return this.fb.group({
      serviceId: [item.ItemId, Validators.required],
      name: [item.Name, Validators.required],
      price: [item.Price, [Validators.required, Validators.min(0)]],
      quantity: [item.Quantity || 1, [Validators.required, Validators.min(1), Validators.max(100)]],
      deliveryType: [item.DeliveryType || 'Undefined'],
      shipping: [item.Shipping ?? true],
    });
  }

  // Custom validators
  private minArrayLength(min: number) {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (control instanceof FormArray && control.length < min) {
        return { minArrayLength: { required: min, actual: control.length } };
      }
      return null;
    };
  }

  private expiryValidator(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return { required: true };
    }

    const value = control.value.toString().trim();
    if (!value.includes('/')) {
      return { invalidExpiry: true };
    }

    const [month, year] = value.split('/');
    if (!month || !year || month.length !== 2 || year.length !== 2) {
      return { invalidExpiry: true };
    }

    const expiryMonth = parseInt(month, 10);
    const expiryYear = parseInt('20' + year, 10);

    if (isNaN(expiryMonth) || isNaN(expiryYear) || expiryMonth < 1 || expiryMonth > 12) {
      return { invalidExpiry: true };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      return { cardExpired: true };
    }

    return null;
  }

  // Collapsible section methods
  togglePersonalInfo(): void {
    this.isPersonalInfoCollapsed = !this.isPersonalInfoCollapsed;
  }

  togglePaymentMethod(): void {
    this.isPaymentMethodCollapsed = !this.isPaymentMethodCollapsed;
  }

  // Field validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['invalidExpiry']) return this.translate.instant('VALIDATION.invalid-expiry');
    if (errors['minArrayLength']) return this.translate.instant('VALIDATION.min-array-length');

    if (errors['required']) return this.translate.instant('VALIDATION.REQUIRED');
    if (errors['email'] || errors['pattern']) {
      if (fieldName === 'contactInfo') return this.translate.instant('VALIDATION.EMAIL');
      if (fieldName === 'cardNumber') return this.translate.instant('VALIDATION.card-number');
      if (fieldName === 'expMonth') return this.translate.instant('VALIDATION.expiry-date');
      if (fieldName === 'cvv') return this.translate.instant('VALIDATION.cvv');
      if (fieldName === 'zip') return this.translate.instant('VALIDATION.zip-code');
      if (fieldName === 'firstName' || fieldName === 'lastName' || fieldName === 'city')
        return this.translate.instant('VALIDATION.name');
    }
    if (errors['minlength'])
      return this.translate.instant('VALIDATION.MIN_LENGTH', {
        requiredLength: errors['minlength'].requiredLength,
      });
    if (errors['maxlength'])
      return this.translate.instant('VALIDATION.MAX_LENGTH', {
        requiredLength: errors['maxlength'].requiredLength,
      });
    if (errors['cardExpired']) return this.translate.instant('VALIDATION.card-expired');
    if (errors['min'])
      return this.translate.instant('VALIDATION.min-value', { min: errors['min'].min });
    if (errors['max'])
      return this.translate.instant('VALIDATION.max-value', { max: errors['max'].max });

    return this.translate.instant('VALIDATION.INVALID');
  }

  // Format card number with spaces
  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

    // Limit to 16 digits for most cards
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    // Add spaces every 4 characters
    const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();

    input.value = formattedValue;
    // Update form with raw numbers (without spaces)
    this.form.patchValue({ cardNumber: value });

    // Trigger validation
    this.form.get('cardNumber')?.updateValueAndValidity();
  }

  // Format expiry date
  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.length >= 2) {
      const month = value.substring(0, 2);
      const monthNum = parseInt(month, 10);
      if (monthNum < 1 || monthNum > 12) {
        // Auto-correct invalid month
        value = '12' + value.substring(2);
      }
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    input.value = value;
    this.form.patchValue({ expMonth: value });
  }

  // Prevent non-numeric input for certain fields
  restrictToNumbers(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (!/^\d$/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  async onPay(): Promise<void> {
    if (this.isSubmitting || this.loading) {
      return;
    }

    this.markFormGroupTouched(this.form);

    if (this.form.invalid) {
      const errorMsg = this.translate.instant('checkout.validation-errors') || 'Validation errors';
      this.toastService.error(errorMsg);
      this.scrollToFirstInvalid();
      return;
    }

    if (!this.acceptScriptLoaded) {
      const errorMsg = this.translate.instant('checkout.payment-loading') || 'Payment loading...';
      this.toastService.error(errorMsg);
      return;
    }

    this.isSubmitting = true;
    this.loading = true;

    try {
      await this.acceptReady;
      await this.tokenizeCard();
    } catch (error) {
      this.handlePaymentError(error);
    }
  }

  private handlePaymentError(error: any): void {
    this.loading = false;
    this.isSubmitting = false;

    if (error instanceof Error) {
      const errorMsg = this.translate.instant('checkout.payment-error') || 'Payment error';
      this.toastService.error(errorMsg);
    } else {
      const errorMsg = this.translate.instant('checkout.payment-failed') || 'Payment failed';
      this.toastService.error(errorMsg);
    }

    console.error('Payment error:', error);
  }

  /**
   * Load Accept.js script dynamically with better error handling
   */
  private async loadAcceptScript(): Promise<void> {
    const id = 'authorize-accept-js';
    const useSandbox = (environment as any).useSandboxAcceptJs ?? !environment.production;

    // Check if already loaded
    if (document.getElementById(id) && window.Accept) {
      this.acceptScriptLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Accept.js loading timeout'));
      }, this.ACCEPT_SCRIPT_LOAD_TIMEOUT);

      const script = document.createElement('script');
      script.id = id;
      script.type = 'text/javascript';
      script.async = true;
      script.src = useSandbox ? this.CONFIG.sandboxAcceptUrl : this.CONFIG.productionAcceptUrl;

      script.onload = () => {
        clearTimeout(timeoutId);
        const start = Date.now();
        const wait = () => {
          if (window.Accept && typeof window.Accept.dispatchData === 'function') {
            this.acceptScriptLoaded = true;
            resolve();
          } else if (Date.now() - start > 5000) {
            reject(new Error('Accept.js loaded but did not initialize in time.'));
          } else {
            setTimeout(wait, 100);
          }
        };
        wait();
      };

      script.onerror = (err) => {
        clearTimeout(timeoutId);
        this.acceptScriptLoaded = false;
        reject(new Error('Failed to load Accept.js: ' + String(err)));
      };

      document.body.appendChild(script);
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private scrollToFirstInvalid(): void {
    const firstInvalidElement = document.querySelector('.ng-invalid');
    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      // Focus the first invalid input for better accessibility
      const inputElement = firstInvalidElement as HTMLElement;
      if (typeof inputElement.focus === 'function') {
        inputElement.focus();
      }
    }
  }

  private setupFormValidation(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Clear promo code error when user starts typing
      if (this.promoCodeError && this.form.get('promoCode')?.dirty) {
        this.promoCodeError = '';
      }

      // Force validation updates
      this.cdr.detectChanges();
    });

    // Validate expiry date in real-time
    this.form
      .get('expMonth')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const control = this.form.get('expMonth');
        control?.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });

    // Validate card number in real-time
    this.form
      .get('cardNumber')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const control = this.form.get('cardNumber');
        control?.updateValueAndValidity({ onlySelf: false, emitEvent: false });
      });
  }

  private initializeModal(): void {
    // Modal initialization would go here
    // Using setTimeout to ensure DOM is ready
    setTimeout(() => {
      this.setupCvvModal();
    }, 0);
  }

  private setupCvvModal(): void {
    const modalElement = document.getElementById('cvvHelpModal');
    if (modalElement && window.bootstrap) {
      this.modal = new window.bootstrap.Modal(modalElement);
    }
  }

  private cleanupModal(): void {
    if (this.modal) {
      this.modal.dispose();
      this.modal = null;
    }
  }

  private async tokenizeCard(): Promise<void> {
    const [month, year] = (this.form.value.expMonth || '/').split('/');
    const fullYear = year ? (year.length === 2 ? '20' + year : year) : '';

    // Additional validation
    if (!month || !fullYear || fullYear.length !== 4) {
      throw new Error('Invalid expiry date format');
    }

    const cardNumber = (this.form.value.cardNumber || '').toString().replace(/\s+/g, '');
    if (cardNumber.length < 12 || cardNumber.length > 19) {
      throw new Error('Invalid card number length');
    }

    const secureData = {
      authData: {
        clientKey: this.CONFIG.clientKey,
        apiLoginID: this.CONFIG.apiLoginID,
      },
      cardData: {
        cardNumber: cardNumber,
        month: month,
        year: fullYear,
        cardCode: this.form.value.cvv,
      },
    };

    return new Promise((resolve, reject) => {
      try {
        window.Accept.dispatchData(secureData, (response: any) => {
          this.acceptResponseHandler(response);
          resolve();
        });
      } catch (ex: any) {
        reject(new Error('Payment processing error: ' + (ex?.message || ex)));
      }
    });
  }

  private acceptResponseHandler(response: any): void {
    console.log('Accept.js raw response:', response);

    if (!response || !response.opaqueData || !response.opaqueData.dataValue) {
      const errMsg =
        response?.messages?.message?.map((m: any) => m.text).join(' | ') ||
        'Tokenization failed: no token returned.';
      throw new Error(errMsg);
    }

    if (response.messages?.resultCode === 'Error') {
      const errorMessages = response.messages.message.map((m: any) => m.text).join(' | ');
      throw new Error(errorMessages);
    }

    const opaque = {
      dataDescriptor: response.opaqueData.dataDescriptor,
      dataValue: response.opaqueData.dataValue,
    };

    const payOrder = this.buildServerPayload(opaque);
    console.log('PayOrder:', payOrder);
    this.facade
      .checkout(payOrder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.isSubmitting = false;

          // Debug log to inspect real response shape
          console.log('Checkout API response:', res);

          // Normalize success and orderId fields (accept either casing)
          const success = res?.Success ?? res?.success ?? false;
          const orderId = res?.OrderId ?? res?.orderId ?? res?.OrderID ?? res?.orderID ?? null;
          const message = res?.Message ?? res?.message ?? res?.MessageText ?? null;
          const error = res?.Error ?? res?.error ?? null;

          // If backend says success -> handle success
          if (success === true) {
            // attach normalized fields to response object used by handlers
            const normalized: any = {
              ...res,
              Success: true,
              OrderId: orderId,
              Message: message,
              Error: error,
            };
            this.handleSuccess(normalized);
            return;
          }

          const normalizedError: any = {
            ...res,
            Success: false,
            OrderId: orderId,
            Message: message,
            Error: error,
          };
          this.handleCheckoutError(normalizedError);
        },
        error: (err: Error) => {
          this.loading = false;
          this.isSubmitting = false;
          this.toastService.error(
            this.translate.instant('checkout.payment-failed') || 'Payment failed',
          );
        },
      });
  }

  private handleSuccess(response: any): void {
    const orderId = response.OrderId ?? response.orderId ?? 'N/A';
    const backendMessage = response.Message ?? response.message ?? null;

    const successMsg =
      backendMessage && backendMessage.length
        ? backendMessage
        : this.translate.instant('checkout.payment-successful') || 'Payment successful';

    this.toastService.success(successMsg);

    // Check if cart was appointment-only BEFORE clearing
    const cartItems = this.cartFacade.getCart();
    const isAppointmentOnly =
      cartItems.length === 1 && cartItems[0].id === CART_ITEMS.APPOINTMENT_SERVICE;

    this.cartFacade.clearCart();

    localStorage.setItem('step1Completed', 'true');

    // Clear appointment metadata after successful checkout
    localStorage.removeItem(LOCAL_STORAGE_KEYS.APPOINTMENT_METADATA_KEY);

    setTimeout(() => {
      if (isAppointmentOnly) {
        // Appointment only -> go home
        this.router.navigate(['/home']);
      } else {
        // Regular order -> go to tracking
        this.router
          .navigate(['/checkout/step2', orderId])
          .then((navResult) => {
            if (!navResult) {
              this.router.navigate(['/home']);
            }
          })
          .catch((err) => {
            console.error('Navigation error:', err);
            this.router.navigate(['/home']);
          });
      }
    }, 2000);
  }

  private handleCheckoutError(response: any): void {
    const backendMessage = response?.Message ?? response?.message ?? null;
    const backendError = response?.Error ?? response?.error ?? null;
    const errorMsg =
      (backendMessage && backendMessage.toString()) ||
      (backendError && backendError.toString()) ||
      this.translate.instant('checkout.payment-failed') ||
      'Payment failed';

    this.toastService.error(errorMsg);
    this.form.enable();
  }

  private buildServerPayload(opaque: { dataDescriptor: string; dataValue: string }) {
    const v = this.form.value;

    const items = (v.items || []).map((item: any) => {
      // Normalize deliveryType: numeric or null (no strings)
      let deliveryType: number | null = null;
      if (
        item.deliveryType !== undefined &&
        item.deliveryType !== null &&
        item.deliveryType !== '' &&
        item.deliveryType !== 'Undefined'
      ) {
        const n = Number(item.deliveryType);
        deliveryType = isNaN(n) ? null : n;
      }

      return {
        serviceId: item.serviceId ?? item.itemId ?? null,
        name: item.name ?? null,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        deliveryType: deliveryType, // number or null
        shipping: !!item.shipping,
      };
    });

    // Check for appointment metadata
    let metadata = null;
    const appointmentMetadata = localStorage.getItem(LOCAL_STORAGE_KEYS.APPOINTMENT_METADATA_KEY);

    if (appointmentMetadata) {
      try {
        // Parse to validate, then stringify for API
        const parsed = JSON.parse(appointmentMetadata);
        metadata = JSON.stringify(parsed);
      } catch (e) {
        console.error('Invalid appointment metadata', e);
      }
    }

    const payOrder = {
      firstName: (v.firstName || '').trim(),
      lastName: (v.lastName || '').trim(),
      address: (v.address || '').trim(),
      country: v.country || null,
      state: v.state || null,
      county: (v.county || '').trim() || null,
      city: (v.city || '').trim(),
      zip: v.zip || null,
      contactInfo: (v.contactInfo || '').trim(),
      cardToken: opaque.dataValue, // <-- required by backend
      promoCode: (v.promoCode || '').trim() || null,
      metadata: metadata, // include appointment metadata
      items: items, // <-- required by backend
    };

    return { payOrder }; // wrapper at root as backend expects
  }

  // Helper getter for the template
  get itemsControls(): FormGroup[] {
    return (this.form.get('items') as FormArray).controls as FormGroup[];
  }

  // Calculate totals
  get subtotal(): number {
    const itemsArray = this.form.get('items') as FormArray;
    if (!itemsArray) return 0;

    return itemsArray.controls.reduce((total, itemControl) => {
      const item = itemControl.value;
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }

  // get tax(): number {
  //   return Math.round(this.subtotal * 0.04 * 100) / 100; // 4% tax
  // }

  applyPromoCode(): void {
    const promoCode = this.form.get('promoCode')?.value?.trim();

    if (!promoCode) {
      this.promoCodeError = this.translate.instant('checkout.promo-code-required');
      this.promoCodeApplied = false;
      this.promoCodeDiscount = 0;
      return;
    }

    this.facade
      .applyPromoCode({ code: promoCode, priceBefore: this.subtotal })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(
        map((res) => {
          if (res && res.succeeded) {
            return res.data;
          }
          return null;
        }),
      )
      .subscribe({
        next: (res: ApplyPromoCodeResponse | null) => {
          if (res) {
            if (!res.isValid || (res.expiryDate && new Date(res.expiryDate) < new Date())) {
              this.promoCodeError = this.translate.instant('checkout.promo-code-expired');
              this.promoCodeDiscount = 0;
              this.promoCodeApplied = false;
              this.promoCodeSuccessMessage = '';
              return;
            }

            this.promoCodeApplied = true;
            this.promoCodeError = '';

            // Calculate discount based on response
            if (res.price !== undefined && res.price !== null) {
              // If API returns the final price, calculate discount from it
              this.promoCodeDiscount = Math.max(0, this.subtotal - res.price);
            } else {
              // Otherwise calculate from discount amount and type
              this.promoCodeDiscount =
                res.type === 'percentage'
                  ? (this.subtotal * res.discountAmount!) / 100
                  : res.discountAmount! || 0;
            }

            // Set success message with discount details
            if (res.type === 'percentage' && res.discountAmount) {
              this.promoCodeSuccessMessage = this.translate.instant(
                'checkout.promo-code-applied-percentage',
                { percentage: res.discountAmount },
              );
            } else if (res.type === 'fixed' && res.discountAmount) {
              this.promoCodeSuccessMessage = this.translate.instant(
                'checkout.promo-code-applied-fixed',
                { amount: res.discountAmount },
              );
            } else {
              this.promoCodeSuccessMessage = this.translate.instant('checkout.promo-code-applied');
            }

            // Show success toast
            this.toastService.success(this.promoCodeSuccessMessage);
          }
        },
        error: () => {
          this.promoCodeError = this.translate.instant('checkout.promo-code-error');
          this.promoCodeApplied = false;
          this.promoCodeDiscount = 0;
          this.promoCodeSuccessMessage = '';
        },
      });
  }

  removePromoCode(): void {
    this.promoCodeApplied = false;
    this.promoCodeError = '';
    this.promoCodeDiscount = 0;
    this.promoCodeSuccessMessage = '';
    this.form.get('promoCode')?.setValue('');
  }

  // Update the total calculation to include discount
  get total(): number {
    // const total = Math.max(0, this.subtotal + this.tax - this.promoCodeDiscount);
    const total = Math.max(0, this.subtotal - this.promoCodeDiscount);
    return Math.round(total * 100) / 100;
  }

  // Helper method to check if item is appointment
  isAppointmentItem(serviceId: string): boolean {
    return serviceId === CART_ITEMS.APPOINTMENT_SERVICE;
  }

  // Quantity methods
  incrementQuantity(index: number): void {
    const itemsArray = this.form.get('items') as FormArray;
    const itemGroup = itemsArray.at(index) as FormGroup;
    const serviceId = itemGroup.get('serviceId')?.value;

    // Prevent quantity change for appointments
    if (this.isAppointmentItem(serviceId)) {
      return;
    }

    const currentQuantity = itemGroup.get('quantity')?.value || 0;

    if (currentQuantity < 100) {
      // Maximum quantity limit
      itemGroup.get('quantity')?.setValue(currentQuantity + 1);
    }
  }

  decrementQuantity(index: number): void {
    const itemsArray = this.form.get('items') as FormArray;
    const itemGroup = itemsArray.at(index) as FormGroup;
    const serviceId = itemGroup.get('serviceId')?.value;

    // Prevent quantity change for appointments
    if (this.isAppointmentItem(serviceId)) {
      return;
    }

    const currentQuantity = itemGroup.get('quantity')?.value || 0;

    if (currentQuantity > 1) {
      itemGroup.get('quantity')?.setValue(currentQuantity - 1);
    }
  }

  showCvvHelp(): void {
    if (this.modal) {
      this.modal.show();
    }
  }

  // Security: Clear sensitive data
  clearSensitiveData(): void {
    this.form.patchValue({
      cardNumber: '',
      expMonth: '',
      cvv: '',
    });
  }

  // Accessibility helpers
  getAriaDescribedBy(fieldName: string): string {
    return this.isFieldInvalid(fieldName) ? `${fieldName}-error` : '';
  }

  getAriaInvalid(fieldName: string): string {
    return this.isFieldInvalid(fieldName) ? 'true' : 'false';
  }
}
