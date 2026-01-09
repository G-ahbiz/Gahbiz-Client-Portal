import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-not-available',
  templateUrl: './not-available.component.html',
  styleUrls: ['./not-available.component.scss'],
})
export class NotAvailableComponent {
  @Input() title: string = 'Not available';
  @Input() message: string = 'This option is not available right now, Stay tuned';

  private defaultSvg: string = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 112" class="w-full h-full">
      <path fill-rule="evenodd" clip-rule="evenodd"
        d="M60.7254 0.874961C73.3254 1.66246 85.1379 7.96246 93.8004 16.625C104.038 27.65 109.55 41.0375 109.55 56.7875C109.55 69.3875 104.825 81.2 96.9504 91.4375C89.0754 100.887 78.0504 107.975 65.4504 110.337C52.8504 112.7 40.2504 111.125 29.2254 104.825C18.2004 98.525 9.53789 89.075 4.81289 77.2625C0.0878921 65.45 -0.699608 52.0625 3.23789 40.25C7.17539 27.65 14.2629 17.4125 25.2879 10.325C35.5254 3.23746 48.1254 0.0874608 60.7254 0.874961ZM64.6629 102.462C74.9004 100.1 84.3504 94.5875 91.4379 85.925C97.7379 77.2625 101.675 67.025 100.888 56C100.888 43.4 96.1629 30.8 87.5004 22.1375C79.6254 14.2625 70.1754 9.53746 59.1504 8.74996C48.9129 7.96246 37.8879 10.325 29.2254 16.625C20.5629 22.925 14.2629 31.5875 11.1129 42.6125C7.96289 52.85 7.96289 63.875 12.6879 74.1125C17.4129 84.35 24.5004 92.225 33.9504 97.7375C43.4004 103.25 54.4254 104.825 64.6629 102.462ZM55.2129 52.0625L74.1129 32.375L79.6254 37.8875L60.7254 57.575L79.6254 77.2625L74.1129 82.775L55.2129 63.0875L36.3129 82.775L30.8004 77.2625L49.7004 57.575L30.8004 37.8875L36.3129 32.375L55.2129 52.0625Z"
        fill="#005DB5" />
    </svg>
  `;

  private _icon: SafeHtml | null = null;

  @Input() set icon(svg: string | null) {
    this._icon = this.sanitizer.bypassSecurityTrustHtml(svg ?? this.defaultSvg);
  }

  get icon(): SafeHtml {
    return this._icon ?? this.sanitizer.bypassSecurityTrustHtml(this.defaultSvg);
  }

  constructor(private sanitizer: DomSanitizer) {}
}
