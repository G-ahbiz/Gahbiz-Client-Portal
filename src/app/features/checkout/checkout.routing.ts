import { Routes } from '@angular/router';
import { Checkout } from './page/checkout';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: Checkout,
    children: [
      {
        path: 'step1',
        loadComponent: () =>
          import('./components/step1-checkout/step1-checkout').then((m) => m.Step1Checkout),
      },
      {
        path: 'step2/:orderId',
        loadComponent: () =>
          import('./components/step2-documentaion/step2-documentaion').then(
            (m) => m.Step2Documentaion
          ),
      },
      {
        path: 'step3',
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
      { path: '', redirectTo: 'step1', pathMatch: 'full' },
    ],
  },
];
