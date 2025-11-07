import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Navbar } from '@shared/components/navbar/navbar';
import { Footer } from '@shared/components/footer/footer';
import { EmptyCart } from '../../components/empty-cart/empty-cart';
import { AllServicesComponentService } from '@shared/services/all-services-component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartCards } from '../../components/cart-cards/cart-cards';
import { CartSummary } from '../../components/cart-summary/cart-summary';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { ToastService } from '@shared/services/toast.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [Navbar, Footer, EmptyCart, TranslateModule, CommonModule, CartCards, CartSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit, OnDestroy {
  // Cart items
  cartItems = signal<CartItem[]>([]);

  private cartFacadeService = inject(CartFacadeService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private allServicesService: AllServicesComponentService) {}

  ngOnInit() {
    this.cartItems.update(() => this.getCartItems());
  }

  // navigate to service details
  navigateToServiceDetails(serviceId: number) {
    this.allServicesService.setActiveService(serviceId);
    this.router.navigate(['/service-details']);
  }

  getCartItems(): CartItem[] {
    try {
      return this.cartFacadeService.getCart();
    } catch (error) {
      console.error('Error getting cart items:', error);
      this.toastService.error('Failed to load cart items', 3000);
      return [];
    }
  }

  onCartItemsChanged(serviceId: string) {
    try {
      this.cartFacadeService.removeFromCart(serviceId);
      this.cartItems.update(() => this.getCartItems());
      this.toastService.success('Item removed from cart', 3000);
    } catch (error) {
      console.error('Error removing cart item:', error);
      this.toastService.error('Failed to remove item from cart', 3000);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
