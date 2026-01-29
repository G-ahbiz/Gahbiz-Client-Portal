import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, filter, switchMap } from 'rxjs';
import { CartItem } from '../interfaces/cart-item';
import { AuthService } from '@core/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CartFacadeService {
  private readonly authService = inject(AuthService);

  currentUserId = signal<string | undefined>(undefined);
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    this.authService.initialized$
      .pipe(
        filter((initialized) => initialized),
        switchMap(() => this.authService.currentUser$),
      )
      .subscribe((user) => {
        const previousUserId = this.currentUserId();
        const newUserId = user?.id;

        // If user changed (login, logout, or switch user) clear cart
        if (previousUserId !== newUserId) {
          if (previousUserId && !newUserId) {
            localStorage.removeItem(`cart_${previousUserId}`);
          }

          this.currentUserId.set(newUserId);

          this.cartSubject.next(this.loadCart());
        }
      });
  }

  private storageKey(): string {
    const id = this.currentUserId();
    return id ? `cart_${id}` : 'cart_guest';
  }

  private loadCart(): CartItem[] {
    return JSON.parse(localStorage.getItem(this.storageKey()) || '[]');
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(cart));
    this.cartSubject.next(cart);
  }

  addToCart(cartItem: CartItem): boolean {
    let cart = this.loadCart();
    const existingCartItem = cart.find((item) => item.id === cartItem.id);
    if (!existingCartItem) {
      cart.push(cartItem);
      this.saveCart(cart);
      return true;
    }
    cart = cart.map((item) =>
      item.id === existingCartItem.id ? { ...item, quantity: item.quantity + 1 } : item,
    );
    this.saveCart(cart);
    return true;
  }

  getCart(): CartItem[] {
    return this.cartSubject.getValue();
  }

  removeFromCart(id: string): void {
    let cart = this.loadCart().filter((item) => item.id !== id);
    this.saveCart(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.storageKey());
    this.cartSubject.next([]);
  }
}
