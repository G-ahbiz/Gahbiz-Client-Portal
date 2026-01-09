import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ServicesDetailsFacadeService } from '@features/all-services/services/services-details/services-details-facade.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { catchError, finalize, of, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-requirements-tab',
  imports: [CommonModule, TranslateModule],
  templateUrl: './requirements-tab.html',
  styleUrl: './requirements-tab.scss',
})
export class RequirementsTab implements OnDestroy {
  private destroy$ = new Subject<void>();

  _serviceId: string | undefined;

  @Input()
  set serviceId(id: string | undefined) {
    this._serviceId = id;

    if (this._serviceId) {
      this.getRequirments();
    } else {
      this.isLoading = false;

      this.error = this.translate.instant('REQUIREMENTS.ERRORS.NO_SERVICE_ID');
      this.requirments = [];

      this.cdr.markForCheck();
    }
  }

  get serviceId(): string | undefined {
    return this._serviceId;
  }

  requirments: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private servicesDetailsFacade: ServicesDetailsFacadeService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  getRequirments() {
    if (!this.serviceId) {
      this.error = this.translate.instant('REQUIREMENTS.ERRORS.NO_SERVICE_ID');
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.servicesDetailsFacade
      .getRequiredFiles(this.serviceId)
      .pipe(
        tap((response) => {
          this.requirments = response.files.map((file) => ({
            id: file.id,
            name: file.name,
            description: file.description || this.getDefaultDescription(file.name),
            icon: this.getIconForFileType(file.name),
          }));
          this.error = null;
        }),
        catchError((err) => {
          console.error('Error fetching required files:', err);
          this.error = this.translate.instant('REQUIREMENTS.ERRORS.LOAD_FAILED');
          this.requirments = [];
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getIconForFileType(fileName: string): string {
    const requirementIconsPath =
      '/assets/images/All-services/ServiceDetails/servicesTabs/requirmentsTab/';
    const baseIconPath = '/assets/images/All-services/ServiceDetails/servicesTabs/';

    const iconMap: { [key: string]: string } = {
      'W-2 Form': requirementIconsPath + 'form.svg',
      'Bank Statement': requirementIconsPath + 'bank.svg',
      'Pay Stubs': requirementIconsPath + 'pay.svg',
      'Income Proof': requirementIconsPath + 'income.svg',
      'Tax Return': requirementIconsPath + 'form.svg',
      'ID Document': requirementIconsPath + 'bank.svg',
      'Proof of Address': requirementIconsPath + 'form.svg',
    };

    return iconMap[fileName] || baseIconPath + 'file.svg';
  }

  private getDefaultDescription(fileName: string): string {
    const keyMap: { [key: string]: string } = {
      'W-2 Form': 'W-2_FORM',
      'Bank Statement': 'BANK_STATEMENT',
      'Pay Stubs': 'PAY_STUBS',
      'Income Proof': 'INCOME_PROOF',
    };

    const translationKey = `REQUIREMENTS.DEFAULT_DESCRIPTIONS.${keyMap[fileName]}`;
    let description = this.translate.instant(translationKey);

    if (description === translationKey) {
      description = this.translate.instant('REQUIREMENTS.DEFAULT_DESCRIPTIONS.GENERIC', {
        fileName,
      });
    }

    return description;
  }
}
