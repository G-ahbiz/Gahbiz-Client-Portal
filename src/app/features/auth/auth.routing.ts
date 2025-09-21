import { Routes } from '@angular/router';

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
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page.component').then((m) => m.SignUpPageComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/sign-in/forget-password-form/forget-password-form.component').then(
        (m) => m.ForgetPasswordFormComponent
      ),
  },
  {
    path: 'reset-password/:id',
    loadComponent: () =>
      import('./components/sign-in/reset-password-form/reset-password-form.component').then(
        (m) => m.ResetPasswordFormComponent
      ),
  },
];
