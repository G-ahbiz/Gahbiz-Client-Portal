import { Routes } from '@angular/router';
import { ConfirmEmailGuard } from './guards/confirm-email.guard';
import { SignUpPageComponent } from './pages/sign-up-page/sign-up-page.component';

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
    // loadComponent: () =>
    //   import('./pages/sign-up-page/sign-up-page.component').then((m) => m.SignUpPageComponent),
    component: SignUpPageComponent,
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
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/sign-in/forget-password-form/forget-password-form.component').then(
        (m) => m.ForgetPasswordFormComponent
      ),
    data: { hideHeader: true },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then((m) => m.ResetPassword),
    data: { hideHeader: true },
  },
  {
    path: 'verify-otp/:id',
    loadComponent: () =>
      import('./components/sign-in/verify-otp/verify-otp.component').then((m) => m.VerifyOtp),
    data: { hideHeader: true },
  },
  {
    path: 'new-password/:id',
    loadComponent: () =>
      import('./components/sign-in/new-password/new-password.component').then((m) => m.NewPasswordComponent),
    data: { hideHeader: true },
  },
];
