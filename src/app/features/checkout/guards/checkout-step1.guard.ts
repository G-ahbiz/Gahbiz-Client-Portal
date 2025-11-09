import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const Step1Guard: CanActivateFn = () => {
  const router = inject(Router);

  const cart = localStorage.getItem('cart'); 
  if (!cart || JSON.parse(cart).length === 0) {
    router.navigate(['/cart']); 
    return false;
  }

  return true;
};
