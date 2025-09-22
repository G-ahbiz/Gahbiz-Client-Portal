import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ROUTES } from '../../../../shared/config/constants';
import { SignUpFormComponent } from "../../components/sign-up/sign-up-form/sign-up-form.component";
import { SocialSignUpComponent } from '../../components/sign-up/social-sign-up/social-sign-up.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SignUpFormComponent, SocialSignUpComponent, TranslateModule],
  templateUrl: './sign-up-page.component.html',
  styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent {
  readonly ROUTES = ROUTES;

}
