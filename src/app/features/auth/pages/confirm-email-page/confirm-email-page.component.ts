import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '@core/services/language.service';
import { ROUTES } from '@shared/config/constants';
import { ConfirmEmailFormComponent } from '@features/auth/components/confirm-email/confirm-email-form/confirm-email-form.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email-page',
  imports: [ConfirmEmailFormComponent, TranslateModule],
  templateUrl: './confirm-email-page.component.html',
  styleUrls: ['./confirm-email-page.component.scss'],
})
export class ConfirmEmailPageComponent {
  readonly ROUTES = ROUTES;
  private languageService = inject(LanguageService);

  dir = computed(() => (this.languageService.currentLang() === 'ar' ? 'rtl' : 'ltr'));

  constructor() {}
}
