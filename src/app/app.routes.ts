import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { NoAuthGuard } from '@core/guards/no-auth.guard';
import { Landingpage } from '@features/landingpage/landingpage';
import { Layout } from '@features/layout/layout';

export const routes: Routes = [
  {
    path: 'home',
    component: Layout,
    children: [
      { path: '', component: Landingpage },
      { path: '**', redirectTo: 'Error404', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'all-services',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/all-services/all-services').then((m) => m.AllServices),
  },
  {
    path: 'service-details/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/all-services/service-datails/service-datails').then(
        (m) => m.ServiceDatails
      ),
  },
  {
    path: 'appointment-service',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './features/all-services/appointment-service-component/appointment-service-component'
      ).then((m) => m.AppointmentServiceComponent),
  },
  {
    path: 'complete-profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/complete-profile/complete-profile').then((m) => m.CompleteProfile),
  },
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/cart/pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/checkout/checkout.routing'),
  },
  // { path: 'checkout', canActivate: [NoAuthGuard], loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout) },
  {
    path: 'privacy-policy',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./shared/components/privacy/privacy').then((m) => m.Privacy),
  },
  {
    path: 'terms-and-conditions',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./shared/components/terms/terms').then((m) => m.Terms),
  },
  {
    path: 'Error404',
    canActivate: [NoAuthGuard],
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },
  // {
  //   path: '',
  //   canActivate: [AuthGuard],
  //   loadComponent: () =>
  //     import('./features/landing/pages/landing-page/landing-page.component').then(
  //       (m) => m.LandingPageComponent
  //     ),
  // },
  {
    path: 'auth',
    canActivateChild: [NoAuthGuard],
    loadChildren: () => import('./features/auth/auth.routing').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'Error404', pathMatch: 'full' },
];
