import { Injectable } from '@angular/core';
import { CartItem } from '../interfaces/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartFacadeService {
  addToCart(cartItem: CartItem): boolean {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart) {
      if (!cart.find((item) => item.id === cartItem.id)) {
        cart.push(cartItem);
      } else {
        return false;
      }
    } else {
      cart = [cartItem];
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    return true;
  }

  getCart(): CartItem[] {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  removeFromCart(id: string): void {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter((item) => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  clearCart(): void {
    localStorage.removeItem('cart');
  }
}
