
import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { NoAuthGuard } from '@core/guards/no-auth.guard';
import { Landingpage } from '@features/landingpage/landingpage';
import { Layout } from '@features/layout/layout';


export const routes: Routes = [
  {
    path: 'home', component: Layout, children: [
      { path: '', component: Landingpage },
      { path: '**', redirectTo: 'Error404', pathMatch: 'full' },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'all-services', canActivate: [NoAuthGuard], loadComponent: () => import('./features/all-services/all-services').then(m => m.AllServices) },
  { path: 'service-details', canActivate: [NoAuthGuard], loadComponent: () => import('./features/all-services/service-datails/service-datails').then(m => m.ServiceDatails) },
  { path: 'appointment-service', canActivate: [NoAuthGuard], loadComponent: () => import('./features/all-services/appointment-service-component/appointment-service-component').then(m => m.AppointmentServiceComponent) },
  { path: 'complete-profile', canActivate: [NoAuthGuard], loadComponent: () => import('./features/complete-profile/complete-profile').then(m => m.CompleteProfile) },
  { path: 'cart', canActivate: [NoAuthGuard], loadComponent: () => import('./features/cart/cart').then(m => m.Cart) },
  { path: 'checkout', canActivate: [NoAuthGuard], loadChildren: () => import('./features/checkout/checkout.routing').then(m => m.CHECKOUT_ROUTES) },
  // { path: 'checkout', canActivate: [NoAuthGuard], loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout) },
  { path: 'privacy-policy', canActivate: [NoAuthGuard], loadComponent: () => import('./shared/components/privacy/privacy').then(m => m.Privacy) },
  { path: 'terms-and-conditions', canActivate: [NoAuthGuard], loadComponent: () => import('./shared/components/terms/terms').then(m => m.Terms) },
  { path: 'Error404', canActivate: [NoAuthGuard], loadComponent: () => import('./shared/components/not-found/not-found').then(m => m.NotFound) },
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
