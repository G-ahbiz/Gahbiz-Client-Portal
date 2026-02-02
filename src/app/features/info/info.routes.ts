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
  {
    path: 'terms-and-conditions',
    loadComponent: () =>
      import('./pages/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
];
