import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllServicesComponentService {
  // BehaviorSubject to hold the active service state
  private activeServiceListSubject = new BehaviorSubject<number>(this.getInitialActiveServiceList());
  private activeServiceSubject = new BehaviorSubject<number>(this.getInitialActiveService());
  private cartSubject = new BehaviorSubject<number[]>(this.getInitialCart());

  // Observable that components can subscribe to
  public activeServiceList$: Observable<number> = this.activeServiceListSubject.asObservable();
  public activeService$: Observable<number> = this.activeServiceSubject.asObservable();
  public cart$: Observable<number[]> = this.cartSubject.asObservable();

  constructor() {
    // Initialize active service from localStorage if available
    const storedService = localStorage.getItem('activeServiceList');
    if (storedService) {
      this.activeServiceListSubject.next(parseInt(storedService));
    }
  }

  // Service List
  // Get the initial active service list from localStorage or default to 1
  private getInitialActiveServiceList(): number {
    const stored = localStorage.getItem('activeServiceList');
    return stored ? parseInt(stored) : 1;
  }

  // Get the current active service list value synchronously
  getActiveServiceList(): number {
    return this.activeServiceListSubject.value;
  }

  // Set the active service list and persist to localStorage
  setActiveServiceList(serviceId: number): void {
    this.activeServiceListSubject.next(serviceId);
    localStorage.setItem('activeServiceList', serviceId.toString());
  }

  // Clear active service list (useful for cleanup)
  clearActiveServiceList(): void {
    localStorage.removeItem('activeServiceList');
    this.activeServiceListSubject.next(1);
  }


  // Service Details
  // Get the initial active service from localStorage or default to 1
  private getInitialActiveService(): number {
    const stored = localStorage.getItem('activeService');
    return stored ? parseInt(stored) : 1;
  }

  // Get the current active service value synchronously
  getActiveService(): number {
    return this.activeServiceSubject.value;
  }

  // Set the active service and persist to localStorage
  setActiveService(serviceId: number): void {
    this.activeServiceSubject.next(serviceId);
    localStorage.setItem('activeService', serviceId.toString());
  }

  // Clear active service (useful for cleanup)
  clearActiveService(): void {
    localStorage.removeItem('activeService');
    this.activeServiceSubject.next(1);
  }

  // Cart
  // Get the initial cart from localStorage or default to empty array
  private getInitialCart(): number[] {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  }

  // Get the current cart value synchronously
  getCart(): number[] {
    return this.cartSubject.value;
  }

  // Add to cart
  addToCart(serviceId: number): void {
    // const cart = this.getCart();
    // cart.push(serviceId);
    // this.cartSubject.next(cart);
    // localStorage.setItem('cart', JSON.stringify(cart));
  }
}
