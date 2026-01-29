import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';

export const Step1Guard: CanActivateFn = () => {
  const router = inject(Router);
  const cartFacade = inject(CartFacadeService);

  const cart = cartFacade.getCart();
  if (!cart || cart.length === 0) {
    router.navigate(['/cart']);
    return false;
  }

  return true;
};
