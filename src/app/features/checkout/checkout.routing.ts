import { Routes } from '@angular/router';
import { Checkout } from './page/checkout';
import { Step1Guard } from './guards/checkout-step1.guard';
import { Step2Guard } from './guards/checkout-step2.guard';
import { Step3Guard } from './guards/checkout-step3.guard';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: Checkout,
    children: [
      {
        path: 'step1',
        canActivate: [Step1Guard],
        loadComponent: () =>
          import('./components/step1-checkout/step1-checkout').then((m) => m.Step1Checkout),
      },
      {
        path: 'step2/:orderId',
        canActivate: [Step2Guard],
        loadComponent: () =>
          import('./components/step2-documentaion/step2-documentaion').then(
            (m) => m.Step2Documentaion
          ),
      },
      {
        path: 'step3/:orderId',
        canActivate: [Step3Guard],
        loadComponent: () =>
          import('./components/step3-confirmation/step3-confirmation').then(
            (m) => m.Step3Confirmation
          ),
      },
      {
        path: 'order-services',
        loadComponent: () =>
          import('./components/order-services/order-services').then((m) => m.OrderServices),
      },
      {
        path: 'edit-files/:token',
        loadComponent: () =>
          import('./page/submission-edit/submission-edit').then((m) => m.SubmissionEdit),
      },
      { path: '', redirectTo: 'step1', pathMatch: 'full' },
    ],
  },
];
