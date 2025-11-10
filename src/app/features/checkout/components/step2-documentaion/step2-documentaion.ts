import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { OrderItem } from '@features/checkout/interfaces/order-item';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutFacadeService } from '@features/checkout/services/checkout-facade.service';
import { ToastService } from '@shared/services/toast.service';
import { InputComponent } from '@shared/components/input/input.component';
import { RequiredFilesResponse } from '@features/all-services/interfaces/services-details/required-files/required-files-response';
import { RequiredFile } from '@features/all-services/interfaces/services-details/required-files/required-file';
import { ServicesDetailsFacadeService } from '@features/all-services/services/services-details/services-details-facade.service';
import { FileUploadItem } from '@features/checkout/interfaces/file-upload-item';

@Component({
  selector: 'app-step2-documentaion',
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule, InputComponent],
  templateUrl: './step2-documentaion.html',
  styleUrl: './step2-documentaion.scss',
})
export class Step2Documentaion implements OnInit, OnDestroy {
  step = 2;
  orderItems: OrderItem[] = [];
  orderId!: string;
  serviceDataForms: FormGroup[] = [];
  loading = false;
  orderLoading = false;
  private routeSub!: Subscription;

  expandedStates: boolean[] = [];
  serviceSubmitted: boolean[] = [];

  // Store required files for each service
  requiredFilesMap: { [serviceId: string]: RequiredFile[] } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutFacade: CheckoutFacadeService,
    private toast: ToastService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private servicesDetailsFacade: ServicesDetailsFacadeService
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('orderId');
      if (id) {
        this.orderId = id;
        this.loadOrderItems(this.orderId);
      } else {
        console.warn('No orderId found in route paramMap');
        this.showErrorMessage('checkout.load-order-items-error');
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadOrderItems(orderId: string) {
    this.orderLoading = true;
    this.cdr.detectChanges();

    this.checkoutFacade.getOrderItems(orderId).subscribe({
      next: (items: OrderItem[]) => {
        this.orderItems = Array.isArray(items) ? items : [];

        if (this.orderItems.length === 0) {
          this.showInfoMessage('checkout.no-services-found');
          this.orderLoading = false;
          this.cdr.detectChanges();
          return;
        }

        // Initialize arrays for UI state management
        this.expandedStates = this.orderItems.map((_, i) => i === 0);
        this.serviceSubmitted = this.orderItems.map(() => false);

        this.loadRequiredFiles();
      },
      error: (error) => {
        console.error('Error loading order items:', error);
        this.orderLoading = false;
        this.cdr.detectChanges();
        this.showErrorMessage('checkout.load-order-items-error');
      },
    });
  }

  loadRequiredFiles() {
    const requests = this.orderItems.map((item) =>
      this.servicesDetailsFacade.getRequiredFiles(item.itemId)
    );

    forkJoin(requests).subscribe({
      next: (responses: RequiredFilesResponse[]) => {
        // Store required files for each service
        this.orderItems.forEach((item, index) => {
          this.requiredFilesMap[item.itemId] = responses[index]?.files || [];
        });

        this.initializeServiceForms();
        this.orderLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading required files:', error);
        // Initialize with empty required files if API fails
        this.orderItems.forEach((item) => {
          this.requiredFilesMap[item.itemId] = [];
        });
        this.initializeServiceForms();
        this.orderLoading = false;
        this.cdr.detectChanges();
        this.showErrorMessage('checkout.load-error');
      },
    });
  }

  initializeServiceForms() {
    this.serviceDataForms = [];
    this.orderItems.forEach((item, index) => {
      // Build form controls object dynamically
      const formControls: { [key: string]: any } = {
        fullName: ['', [Validators.required]],
        ssn: ['', [Validators.required, Validators.pattern(/^\d{3}-\d{2}-\d{4}$/)]],
        businessName: ['', [Validators.required]],
        ein: ['', [Validators.required, Validators.pattern(/^\d{2}-\d{7}$/)]],
        businessType: ['', [Validators.required]],
        taxYear: ['', [Validators.required]],
      };

      // Add dynamic file controls based on required files from API
      const requiredFiles = this.requiredFilesMap[item.itemId] || [];
      requiredFiles.forEach((requiredFile) => {
        const fieldName = this.getSafeFieldName(requiredFile.id);
        formControls[fieldName] = [null, [Validators.required]];
      });

      // Create the form group with all controls
      this.serviceDataForms.push(this.fb.group(formControls));
    });
  }

  // Helper to create safe field names from file IDs
  private getSafeFieldName(id: string): string {
    return 'file_' + id.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  // Get the form control name for a required file
  getFileFieldName(requiredFile: RequiredFile): string {
    return this.getSafeFieldName(requiredFile.id);
  }

  getRequiredFilesForService(serviceIndex: number): RequiredFile[] {
    const serviceId = this.orderItems[serviceIndex]?.itemId;
    return this.requiredFilesMap[serviceId] || [];
  }

  // Check if all services are submitted
  areAllServicesSubmitted(): boolean {
    return (
      this.serviceSubmitted.length > 0 &&
      this.serviceSubmitted.every((submitted) => submitted === true)
    );
  }

  // Navigate to step 3
  navigateToStep3(): void {
    setTimeout(() => {
      this.router
        .navigate(['/checkout/step3', this.orderId], { replaceUrl: true })
        .then((navResult) => {
          if (!navResult) {
            console.warn('Navigation to step3 failed');
            this.router.navigate(['/home']);
          }
        })
        .catch((err) => {
          console.error('Navigation error:', err);
          this.router.navigate(['/home']);
        });
    }, 2000);
  }

  isServiceFieldInvalid(serviceIndex: number, fieldName: string): boolean {
    const control = this.serviceDataForms[serviceIndex]?.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getServiceFieldError(serviceIndex: number, fieldName: string): string {
    const control = this.serviceDataForms[serviceIndex]?.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED') || 'This field is required';
      }
      if (control.errors['pattern']) {
        return this.translate.instant('VALIDATION.invalid-format') || 'Invalid format';
      }
    }
    return '';
  }

  onFileSelected(event: any, serviceIndex: number, fieldName: string, requiredFile: RequiredFile) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);
      console.log('Required file accept criteria:', requiredFile.accept);

      // Use the accept criteria from the API response
      const validation = this.validateFileAgainstRequirements(file, requiredFile);

      if (!validation.isValid) {
        this.showErrorMessage(validation.error!);
        event.target.value = '';
        return;
      }

      this.serviceDataForms[serviceIndex].get(fieldName)?.setValue(file);
      this.cdr.detectChanges();
    }
  }

  private validateFileAgainstRequirements(
    file: File,
    requiredFile: RequiredFile
  ): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'checkout.file-too-large',
      };
    }

    const acceptCriteria = requiredFile.accept;

    if (!acceptCriteria) {
      return { isValid: true };
    }

    const isValid = this.isFileTypeAccepted(file, acceptCriteria);

    if (!isValid) {
      const errorMessage =
        this.translate.instant('checkout.invalid-file-type-specific', {
          acceptedTypes: acceptCriteria,
        }) || `File type not allowed. Accepted types: ${acceptCriteria}`;

      this.toast.error(errorMessage);
      return { isValid: false, error: 'checkout.invalid-file-type' };
    }

    return { isValid: true };
  }

  private isFileTypeAccepted(file: File, acceptCriteria: string): boolean {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';
    const fileType = file.type;

    const acceptedTypes = acceptCriteria.split(',').map((type) => type.trim());

    console.log('Validation details:', {
      fileName,
      fileExtension,
      fileType,
      acceptedTypes,
    });

    return acceptedTypes.some((acceptedType) => {
      if (acceptedType.includes('/')) {
        if (fileType === acceptedType) {
          return true;
        }

        if (this.isMimeTypeEquivalent(fileType, acceptedType)) {
          return true;
        }

        if (acceptedType.endsWith('/*')) {
          const category = acceptedType.split('/')[0];
          return fileType.startsWith(category + '/');
        }
      }

      let extension = acceptedType;
      if (acceptedType.startsWith('.')) {
        extension = acceptedType.substring(1);
      }

      const normalizedExtension = extension.toLowerCase();

      if (fileExtension === normalizedExtension) {
        return true;
      }

      const mimeTypesForExtension = this.getMimeTypesForExtension(normalizedExtension);
      if (mimeTypesForExtension && mimeTypesForExtension.includes(fileType)) {
        return true;
      }

      return false;
    });
  }

  private isMimeTypeEquivalent(actualMimeType: string, acceptedMimeType: string): boolean {
    const equivalentMimeTypes: { [key: string]: string[] } = {
      'image/jpg': ['image/jpeg'],
      'image/jpeg': ['image/jpg'],
    };

    const equivalents = equivalentMimeTypes[acceptedMimeType];
    return equivalents ? equivalents.includes(actualMimeType) : false;
  }

  private getMimeTypesForExtension(extension: string): string[] {
    const extensionMimeMap: { [key: string]: string[] } = {
      pdf: ['application/pdf'],
      jpg: ['image/jpeg', 'image/jpg'],
      jpeg: ['image/jpeg', 'image/jpg'],
      png: ['image/png'],
      gif: ['image/gif'],
      doc: ['application/msword'],
      docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    return extensionMimeMap[extension] || [];
  }

  removeFile(serviceIndex: number, fieldName: string, inputElement: any) {
    this.serviceDataForms[serviceIndex].get(fieldName)?.setValue(null);
    inputElement.value = '';
    this.cdr.detectChanges();
  }

  getFileName(file: File): string {
    return file ? file.name : '';
  }

  areAllServiceFormsValid(): boolean {
    return this.serviceDataForms.length > 0 && this.serviceDataForms.every((form) => form.valid);
  }

  toggleService(index: number): void {
    if (!this.expandedStates || !this.serviceSubmitted) return;
    if (this.serviceSubmitted[index]) return;

    this.expandedStates = this.orderItems.map((_, i) =>
      i === index ? !this.expandedStates[i] : false
    );
  }

  submitServiceData(index: number): void {
    const form = this.serviceDataForms[index];
    if (form.invalid) {
      form.markAllAsTouched();
      this.showErrorMessage('checkout.validation-errors');
      return;
    }

    const orderItem = this.orderItems[index];
    const serviceId = orderItem?.itemId || '';
    const branchId = orderItem?.branchId || '';

    // Validate that all required files are uploaded
    const requiredFiles = this.getRequiredFilesForService(index);
    const hasAllRequiredFiles = requiredFiles.every((requiredFile) => {
      const fieldName = this.getFileFieldName(requiredFile);
      return form.get(fieldName)?.value instanceof File;
    });

    if (!hasAllRequiredFiles) {
      this.showErrorMessage('checkout.required-files-missing');
      return;
    }

    const formData = this.buildFormData(form, index, serviceId, branchId);
    this.submitFormData(formData, index);
  }

  private buildFormData(
    form: FormGroup,
    index: number,
    serviceId: string,
    branchId: string
  ): FormData {
    const formData = new FormData();
    formData.append('OrderId', this.orderId);
    formData.append('ServiceId', serviceId);
    formData.append('ProviderId', '');
    formData.append('BranchId', branchId);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    formData.append('FulfillmentDate', tomorrow.toISOString());
    formData.append('FulfillmentDuration', '01:00:00');

    const jsonData: Record<string, any> = {
      'Full Name': form.value.fullName,
      'SSN / ITIN': form.value.ssn,
      'Business Name': form.value.businessName,
      EIN: form.value.ein,
      'Business Type': form.value.businessType,
      'Tax Year': form.value.taxYear,
    };
    formData.append('JsonData', JSON.stringify(jsonData));

    const requiredFiles = this.getRequiredFilesForService(index);
    const filesUploaded: FileUploadItem[] = [];

    requiredFiles.forEach((requiredFile) => {
      const fieldName = this.getFileFieldName(requiredFile);
      const file = form.get(fieldName)?.value;
      if (file instanceof File) {
        filesUploaded.push({
          serviceFileId: requiredFile.id,
          file: file,
          note: 'Uploaded from documentation step',
        });
      }
    });

    // Append each file item to FormData
    filesUploaded.forEach((fileItem, fileIndex) => {
      formData.append(`FilesUploaded[${fileIndex}].serviceFileId`, fileItem.serviceFileId);
      formData.append(`FilesUploaded[${fileIndex}].file`, fileItem.file, fileItem.file.name);
      formData.append(`FilesUploaded[${fileIndex}].note`, fileItem.note);
    });

    return formData;
  }

  private submitFormData(formData: FormData, index: number): void {
    this.loading = true;

    this.checkoutFacade.submitServiceSubmission(formData).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccessMessage('checkout.service-data-submitted');

        this.expandedStates[index] = false;
        this.serviceSubmitted[index] = true;

        // Check if all services are submitted after this successful submission
        if (this.areAllServicesSubmitted()) {
          this.showSuccessMessage('checkout.all-services-submitted');
          setTimeout(() => this.navigateToStep3(), 1500);
          localStorage.setItem('step2Completed', 'true');
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Submission error:', err);
        this.showErrorMessage('checkout.service-data-error');
      },
    });
  }

  private showSuccessMessage(translationKey: string): void {
    const message = this.translate.instant(translationKey);
    this.toast.success(message);
  }

  private showErrorMessage(translationKey: string): void {
    const message = this.translate.instant(translationKey);
    this.toast.error(message);
  }

  private showInfoMessage(translationKey: string): void {
    const message = this.translate.instant(translationKey);
    this.toast.info(message);
  }

  // Helper method to check if service is expandable
  isServiceExpandable(index: number): boolean {
    return !this.serviceSubmitted[index];
  }

  // Get service display name
  getServiceName(index: number): string {
    return this.orderItems[index]?.itemName || `Service ${index + 1}`;
  }
}
