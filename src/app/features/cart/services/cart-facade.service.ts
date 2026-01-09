import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../interfaces/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartFacadeService {
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  cart$ = this.cartSubject.asObservable();

  private loadCart(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(cart));
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
    localStorage.removeItem('cart');
    this.cartSubject.next([]);
  }
}
