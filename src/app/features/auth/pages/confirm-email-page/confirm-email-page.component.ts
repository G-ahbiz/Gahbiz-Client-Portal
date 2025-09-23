import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfirmEmailFormComponent } from '@features/auth/components/confirm-email/confirm-email-form/confirm-email-form.component';
import { ROUTES } from '@shared/config/constants';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-email-page',
  imports: [ConfirmEmailFormComponent, RouterLink, TranslateModule],
  templateUrl: './confirm-email-page.component.html',
  styleUrls: ['./confirm-email-page.component.scss']
})
export class ConfirmEmailPageComponent {
  readonly ROUTES = ROUTES;

  constructor() { }

}
