import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartItem } from '../interfaces/cart-item';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartFacadeService {
  private readonly authService = inject(AuthService);
  currentUserId = signal<string | undefined>(undefined);
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  private loadCart(): CartItem[] {
    this.authService.currentUser$
      .pipe(
        map((u) => {
          this.currentUserId.set(u?.id);
        }),
      )
      .subscribe();
    return JSON.parse(localStorage.getItem(`cart_${this.currentUserId()}`) || '[]');
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(`cart_${this.currentUserId()}`, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addToCart(cartItem: CartItem): boolean {
    let cart = this.loadCart();

    if (!cart.find((item) => item.id === cartItem.id)) {
      cart.push(cartItem);
      this.saveCart(cart);
      return true;
    }

    return false;
  }

  getCart(): CartItem[] {
    return this.cartSubject.getValue();
  }

  removeFromCart(id: string): void {
    let cart = this.loadCart().filter((item) => item.id !== id);
    this.saveCart(cart);
  }

  clearCart(): void {
    localStorage.removeItem(`cart_${this.currentUserId()}`);
    this.cartSubject.next([]);
  }
}
