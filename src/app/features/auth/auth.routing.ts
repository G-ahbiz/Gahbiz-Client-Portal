import { Routes } from '@angular/router';
import { ConfirmEmailGuard } from './guards/confirm-email.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in-page/sign-in-page.component').then((m) => m.SignInPageComponent),
    data: { hideHeader: true },
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page.component').then((m) => m.SignUpPageComponent),
    data: { hideHeader: true },
  },
  {
    path: 'confirm-email',
    loadComponent: () =>
      import('./pages/confirm-email-page/confirm-email-page.component').then(
        (m) => m.ConfirmEmailPageComponent
      ),
    data: { hideHeader: true },
  },
  {
    path: 'confirm-email-link',
    loadComponent: () =>
      import('./components/confirm-email/confirm-email-form/confirm-email-form.component').then(
        (m) => m.ConfirmEmailFormComponent
      ),
    data: { hideHeader: true },
    canActivate: [ConfirmEmailGuard],
  },
];
