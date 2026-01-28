import { Routes } from '@angular/router';

export const INFO_ROUTES: Routes = [
  {
    path: 'contact-us',
    loadComponent: () => import('./pages/contact-us/contact-us').then((m) => m.ContactUs),
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/about-us/about-us').then((m) => m.AboutUs),
  },
  // {
  //   path: 'terms-and-conditions',
  //   loadComponent: () =>
  //     import('./pages/terms-and-conditions/terms-and-conditions').then((m) => m.TermsAndConditions),
  // },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
