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
      data: { hideHeader: true },
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./pages/sign-up-page/sign-up-page.component').then((m) => m.SignUpPageComponent),
      data: { hideHeader: true },
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/sign-in/forget-password-form/forget-password-form.component').then(
        (m) => m.ForgetPasswordFormComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'verify-otp/:id',
    loadComponent: () =>
      import('./components/sign-in/verify-otp/verify-otp').then((m) => m.VerifyOtp),
  },
  {
    path: 'new-password/:id',
    loadComponent: () =>
      import('./components/sign-in/new-password/new-password').then((m) => m.NewPassword),
  },
];
