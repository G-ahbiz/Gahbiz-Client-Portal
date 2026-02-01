import { Routes } from '@angular/router';
import { AuthGuard } from '@core/guards/auth.guard';
import { NoAuthGuard } from '@core/guards/no-auth.guard';
import { Layout } from '@features/layout/layout';

export const routes: Routes = [
  // Auth routes without Layout (no navbar/footer)
  {
    path: 'auth',
    canActivateChild: [NoAuthGuard],
    loadChildren: () => import('./features/auth/auth.routing').then((m) => m.AUTH_ROUTES),
  },

  // All other routes wrapped with Layout (includes navbar/footer)
  {
    path: '',
    component: Layout,
    children: [
      // Home/Landing page
      {
        path: 'home',
        loadComponent: () => import('./features/landingpage/landingpage').then(m => m.Landingpage),
      },

      // Order Tracking
      {
        path: 'order-tracking/:orderId',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./features/checkout/page/order-tracking/order-tracking').then(
            (m) => m.OrderTracking
          ),
      },
      // Checkout
      {
        path: 'checkout',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./features/checkout/checkout.routing').then((m) => m.CHECKOUT_ROUTES),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      // Privacy Policy
      {
        path: 'privacy-policy',
        loadComponent: () => import('./shared/components/privacy/privacy').then((m) => m.Privacy),
      },
    
      // Terms and Conditions
      {
        path: 'terms-and-conditions',
        loadComponent: () => import('./shared/components/terms/terms').then((m) => m.Terms),
      },
    ],
  },

  // All Services
  {
    path: 'all-services',
    loadComponent: () => import('./features/all-services/all-services').then((m) => m.AllServices),
  },

  // Service Details
  {
    path: 'service-details/:id',
    loadComponent: () =>
      import('./features/all-services/service-datails/service-datails').then(
        (m) => m.ServiceDatails
      ),
  },

  // Appointment Service
  {
    path: 'appointment-service',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import(
        './features/all-services/appointment-service-component/appointment-service-component'
      ).then((m) => m.AppointmentServiceComponent),
  },

  // Complete Profile
  {
    path: 'complete-profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/complete-profile/complete-profile').then((m) => m.CompleteProfile),
  },

  {
    path: 'wishlist',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/wishlist/page/wishlist.component').then((m) => m.WishlistComponent),
  },

  // Cart
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/cart/pages/cart/cart').then((m) => m.Cart),
  },

  // 404 Error
  {
    path: 'Error404',
    loadComponent: () => import('./shared/components/not-found/not-found').then((m) => m.NotFound),
  },

  // Wildcard - redirect to 404
  {
    path: '**',
    redirectTo: 'Error404',
    pathMatch: 'full',
  },
];
