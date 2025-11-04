import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ServicesDetailsResponse } from '@features/all-services/interfaces/services-details/services-details-response';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-description-tab',
  imports: [TranslateModule, CommonModule],
  templateUrl: './description-tab.html',
  styleUrl: './description-tab.scss',
})
export class DescriptionTab {
  @Input() service: ServicesDetailsResponse | null = null;

  safeDescription: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['service'] && this.service) {
      this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.service.description);
    }
  }
}
