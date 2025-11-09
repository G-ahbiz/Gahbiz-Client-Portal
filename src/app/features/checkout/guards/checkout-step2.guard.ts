import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const Step2Guard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);

  const paymentDone = localStorage.getItem('step1Completed');
  if (!paymentDone) {
    router.navigate(['/checkout/step1']);
    return false;
  }

  return true;
};
