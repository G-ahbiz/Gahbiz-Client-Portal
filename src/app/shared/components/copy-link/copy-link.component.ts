import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-copy-link',
  imports: [CommonModule],
  templateUrl: './copy-link.component.html',
  styleUrls: ['./copy-link.component.scss'],
})
export class CopyLinkComponent {
  @Input() offerId!: string;
  @Input() basePath: string = '/service-details';

  copied = false;

  constructor(
    private toastService: ToastService,
    private translateService: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  copyPageUrl(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.offerId || this.copied) return;

    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}${this.basePath}/${this.offerId}`;

    navigator.clipboard.writeText(fullUrl).then(
      () => {
        this.copied = true;
        this.cd.markForCheck();

        const message =
          this.translateService.instant('best-offers.toasts.url-copied') || 'Service URL copied!';
        this.toastService.success(message);

        setTimeout(() => {
          this.copied = false;
          this.cd.markForCheck();
        }, 2000);
      },
      (err) => {
        console.error('Failed to copy URL:', err);
        const message =
          this.translateService.instant('best-offers.toasts.url-copy-failed') ||
          'Failed to copy URL.';
        this.toastService.error(message);
      }
    );
  }
}
