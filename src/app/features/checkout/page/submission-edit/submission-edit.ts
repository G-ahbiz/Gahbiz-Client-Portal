import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CheckoutFacadeService } from '@features/checkout/services/checkout-facade.service';
import { ToastService } from '@shared/services/toast.service';
import { RequiredToEditFilesResponse } from '@features/checkout/interfaces/required-to-edit-files';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-submission-edit',
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './submission-edit.html',
  styleUrl: './submission-edit.scss',
})
export class SubmissionEdit implements OnInit {
  token!: string;
  editFilesResponse: RequiredToEditFilesResponse | null = null;
  editForm!: FormGroup;
  loading = signal<boolean>(false);
  dataLoading = signal<boolean>(false);

  private destroyRef = inject(DestroyRef);

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
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.dataLoading.set(false))
      )
      .subscribe((paramMap) => {
        const token = paramMap.get('token');
        if (token) {
          this.token = token;
          this.loadRequiredFiles(this.token);
        } else {
          console.warn('No token found in route paramMap');
          this.showErrorMessage('checkout.invalid-token');
          this.router.navigate(['/home']);
        }
      });
  }

  loadRequiredFiles(token: string) {
    this.dataLoading.set(true);
    this.cdr.detectChanges();

    this.checkoutFacade
      .getRequiredToEditFiles(token)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.dataLoading.set(false))
      )
      .subscribe({
        next: (response: RequiredToEditFilesResponse) => {
          this.editFilesResponse = response;
          this.initializeForm();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading required files:', error.error);
          this.cdr.detectChanges();
          this.showErrorMessage(error.error);
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
      });
  }

  initializeForm() {
    if (!this.editFilesResponse) return;

    const formControls: { [key: string]: any } = {};

    this.editFilesResponse.editRequests.forEach((file) => {
      const fieldName = this.getFieldName(file.serviceFileId);
      formControls[fieldName] = [null, [Validators.required]];
    });

    this.editForm = this.fb.group(formControls);
  }

  private getFieldName(serviceFileId: string): string {
    return 'file_' + serviceFileId.toLowerCase().replace(/[^a-z0-9]/g, '_');
  }

  onFileSelected(event: any, serviceFileId: string) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Type:', file.type, 'Size:', file.size);

      const validation = this.validateFile(file);

      if (!validation.isValid) {
        this.showErrorMessage(validation.error!);
        event.target.value = '';
        return;
      }

      const fieldName = this.getFieldName(serviceFileId);
      this.editForm.get(fieldName)?.setValue(file);
      this.cdr.detectChanges();
    }
  }

  isTarget(serviceFileId: string): boolean {
    return (
      this.editFilesResponse?.requiredFiles.find((file) => file.serviceFileId === serviceFileId)
        ?.isTarget || false
    );
  }

  private validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'checkout.file-too-large',
      };
    }

    return { isValid: true };
  }

  removeFile(serviceFileId: string, inputElement: any) {
    const fieldName = this.getFieldName(serviceFileId);
    this.editForm.get(fieldName)?.setValue(null);
    inputElement.value = '';
    this.cdr.detectChanges();
  }

  getFileName(file: File): string {
    return file ? file.name : '';
  }

  isFieldInvalid(serviceFileId: string): boolean {
    const fieldName = this.getFieldName(serviceFileId);
    const control = this.editForm?.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getFieldError(serviceFileId: string): string {
    const fieldName = this.getFieldName(serviceFileId);
    const control = this.editForm?.get(fieldName);
    if (control && control.errors) {
      if (control.errors['required']) {
        return this.translate.instant('VALIDATION.REQUIRED') || 'This field is required';
      }
    }
    return '';
  }

  submitFiles() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.showErrorMessage('checkout.validation-errors');
      return;
    }

    const formData = this.buildFormData();
    this.loading.set(true);

    this.checkoutFacade
      .submitEditedFiles(this.token, formData)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.toast.success(
            this.translate.instant('checkout.files-submitted-successfully') ||
              'Files submitted successfully'
          );
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 2000);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.error(
            this.translate.instant('checkout.submission-error') ||
              'Failed to submit files. Please try again.'
          );
        },
      });
  }

  private buildFormData(): FormData {
    const formData = new FormData();

    if (!this.editFilesResponse) return formData;

    // Append all files with the same key 'newFiles' as an array
    this.editFilesResponse.requiredFiles.forEach((requiredFile) => {
      const fieldName = this.getFieldName(requiredFile.serviceFileId);
      const file = this.editForm.get(fieldName)?.value;
      if (file instanceof File) {
        formData.append('newFiles', file, file.name);
      }
    });

    return formData;
  }

  private showErrorMessage(translationKey: string): void {
    const message = this.translate.instant(translationKey);
    this.toast.error(message);
  }

  getFileByServiceFileId(serviceFileId: string): File | null {
    const fieldName = this.getFieldName(serviceFileId);
    const file = this.editForm?.get(fieldName)?.value;
    return file instanceof File ? file : null;
  }

  getEditRequestByFileId(serviceFileId: string) {
    return this.editFilesResponse?.editRequests.find(
      (request) => request.serviceFileId === serviceFileId
    );
  }
}
