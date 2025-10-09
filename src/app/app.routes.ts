import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { NoAuthGuard } from '@core/guards/no-auth.guard';
import { Landingpage } from '@features/landingpage/landingpage';
import { Layout } from '@features/layout/layout';
import { NotFound } from '@shared/components/not-found/not-found';
import { Terms } from '@shared/components/terms/terms';
import { Privacy } from '@shared/components/privacy/privacy';

export const routes: Routes = [
  {
    path: 'home', component: Layout, children: [
      { path: '', component: Landingpage },
      { path: 'terms-and-conditions', component: Terms },
      { path: 'privacy-policy', component: Privacy },
      { path: '**', redirectTo: 'Error404', pathMatch: 'full' },
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'Error404', component: NotFound },
  { path: '**', redirectTo: 'Error404', pathMatch: 'full' },

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
];
