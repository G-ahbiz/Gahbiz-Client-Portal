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
  {
    path: 'all-services', canActivate: [NoAuthGuard], loadComponent: () => import('./features/all-services/all-services').then(m => m.AllServices), children: [
      { path: 'service-details', canActivate: [NoAuthGuard], loadComponent: () => import('./features/all-services/service-datails/service-datails').then(m => m.ServiceDatails) }
    ]
  },
  { path: 'complete-profile', canActivate: [AuthGuard], loadComponent: () => import('./features/complete-profile/complete-profile').then(m => m.CompleteProfile) },
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
