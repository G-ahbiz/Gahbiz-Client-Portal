import { CommonModule } from '@angular/common';
import { Component, computed, input, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { TranslateModule } from '@ngx-translate/core';
import { CART_ITEMS } from '@shared/config/constants';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cart-summary',
  imports: [TranslateModule, CommonModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.scss',
})
export class CartSummary implements OnDestroy {
  cartItems = input<CartItem[]>([]);

  // Use computed signal for automatic recalculation
  totalPrice = computed(
    () => this.cartItems()?.reduce((total, cartItem) => total + Number(cartItem.price), 0) || 0
  );

  isProfileComplete: boolean = true;

  @Input() isButtonDisabled: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  // navigate to complete profile
  navigateToCompleteProfile() {
    this.router.navigate(['/complete-profile']);
  }

  // Proceed to checkout
  proceedToCheckout() {
    const hasAppointment = this.cartItems().some(
      (item) => item.id === CART_ITEMS.APPOINTMENT_SERVICE
    );

    if (hasAppointment) {
      this.router.navigate(['/appointment-service'], {
        queryParams: { returnToCheckout: 'true' },
      });
    } else {
      this.router.navigate(['/checkout']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
