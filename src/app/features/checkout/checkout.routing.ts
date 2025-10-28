import { Routes } from '@angular/router';
import { Checkout } from './checkout';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: Checkout,
    children: [
      {
        path: 'step1',
        loadComponent: () => import('./step1-checkout/step1-checkout').then(m => m.Step1Checkout),
      },
      {
        path: 'step2',
        loadComponent: () => import('./step2-documentaion/step2-documentaion').then(m => m.Step2Documentaion),
      },
      {
        path: 'step3',
        loadComponent: () => import('./step3-confirmation/step3-confirmation').then(m => m.Step3Confirmation),
      },
      {
        path: '', redirectTo: 'step1', pathMatch: 'full',
      }
    ],
  },
];
