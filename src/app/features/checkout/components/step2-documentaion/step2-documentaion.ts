import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { OrderItem } from '@features/checkout/interfaces/order-item';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutFacadeService } from '@features/checkout/services/checkout-facade.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-step2-documentaion',
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './step2-documentaion.html',
  styleUrl: './step2-documentaion.scss',
})
export class Step2Documentaion {
  step = 2;
  orderItems: OrderItem[] = [];
  serviceDataForms: FormGroup[] = [];
  loading = false;
  orderLoading = false;
  private routeSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutFacade: CheckoutFacadeService,
    private toast: ToastService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((paramMap) => {
      const orderId = paramMap.get('orderId');
      console.log('paramMap orderId:', orderId, 'full paramMap:', paramMap);
      if (orderId) {
        this.loadOrderItems(orderId);
      } else {
        console.warn('No orderId found in route paramMap');
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadOrderItems(orderId: string) {
    console.log('-> loadOrderItems start, orderId:', orderId);
    this.orderLoading = true;
    this.cdr.detectChanges();

    this.checkoutFacade.getOrderItems(orderId).subscribe({
      next: (items: OrderItem[]) => {
        console.log('-> getOrderItems.next items:', items);
        this.orderItems = Array.isArray(items) ? items : [];
        try {
          this.initializeServiceForms();
        } catch (err) {
          console.error('initializeServiceForms threw:', err);
        } finally {
          this.orderLoading = false;
          console.log('-> orderLoading set to false');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error loading order items:', error);
        this.orderLoading = false;
        this.cdr.detectChanges();
        const errorMsg =
          this.translate.instant('checkout.load-order-items-error') ||
          'Failed to load order items. Please try again.';
        this.toast.error(errorMsg);
      },
    });
  }

  initializeServiceForms() {
    this.serviceDataForms = [];
    this.orderItems.forEach((item, index) => {
      this.serviceDataForms.push(
        this.fb.group({
          fullName: ['', [Validators.required]],
          ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
          businessName: [''],
          ein: ['', [Validators.pattern(/^\d{2}-\d{7}$/)]],
          businessType: ['', [Validators.required]],
          taxYear: ['', [Validators.required]],
          w2Form: [null],
          bankStatements: [null],
          payStubs: [null],
          otherIncomeProof: [null],
        })
      );
    });
  }

  isServiceFieldInvalid(serviceIndex: number, fieldName: string): boolean {
    const control = this.serviceDataForms[serviceIndex]?.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getServiceFieldError(serviceIndex: number, fieldName: string): string {
    const control = this.serviceDataForms[serviceIndex]?.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['pattern']) {
        return 'Invalid format';
      }
    }
    return '';
  }

  onFileSelected(event: any, serviceIndex: number, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      this.serviceDataForms[serviceIndex].get(fieldName)?.setValue(file);
    }
  }

  removeFile(serviceIndex: number, fieldName: string, inputElement: any) {
    this.serviceDataForms[serviceIndex].get(fieldName)?.setValue(null);
    inputElement.value = '';
  }

  getFileName(file: File): string {
    return file ? file.name : '';
  }

  areAllServiceFormsValid(): boolean {
    return this.serviceDataForms.length > 0 && this.serviceDataForms.every((form) => form.valid);
  }

  submitServiceData() {
    this.loading = true;

    // Prepare data for submission
    const serviceData = this.serviceDataForms.map((form, index) => ({
      serviceId: this.orderItems[index].itemId,
      serviceName: this.orderItems[index].itemName,
      formData: form.value,
    }));

    // Process form submission
    setTimeout(() => {
      this.loading = false;
      // Navigate to next step or show success
      console.log('Service data submitted:', serviceData);
    }, 2000);
  }

  goToStep(stepNumber: number) {
    this.step = stepNumber;
  }
}
