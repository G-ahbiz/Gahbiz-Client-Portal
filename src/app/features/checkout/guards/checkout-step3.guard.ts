import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const Step3Guard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const step2Done = localStorage.getItem('step2Completed');
  const orderId = route.paramMap.get('orderId');

  if (!step2Done || !orderId) {
    router.navigate(['/checkout/step2']);
    return false;
  }

  return true;
};
