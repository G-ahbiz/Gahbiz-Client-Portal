import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CheckoutApiService } from './checkout-api.service';
import { CheckoutRequest } from '../interfaces/checkout-request';
import { CheckoutResponse } from '../interfaces/checkout-response';
import { OrderItem } from '../interfaces/order-item';
import { ApiResponse } from '@core/interfaces/api-response';
import { Order } from '../interfaces/order';
import { ApplyPromoCodeRequest } from '../interfaces/apply-pc-request';
import { ApplyPromoCodeResponse } from '../interfaces/apply-pc-repsonse';

@Injectable({
  providedIn: 'root',
})
export class CheckoutFacadeService {
  constructor(private api: CheckoutApiService) {}

  checkout(payload: CheckoutRequest | any): Observable<CheckoutResponse> {
    // Validate payload before sending
    this.validateCheckoutPayload(payload);
    return this.api.checkout(payload);
  }

  getOrderById(orderId: string): Observable<ApiResponse<Order>> {
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    return this.api.getOrderById(orderId);
  }

  getOrderItems(orderId: string): Observable<OrderItem[]> {
    return this.getOrderById(orderId).pipe(
      map((response) => {
        if (
          response &&
          response.succeeded &&
          response.data &&
          Array.isArray(response.data.orderItems)
        ) {
          return response.data.orderItems as OrderItem[];
        }
        return [];
      })
    );
  }

  applyPromoCode(payload: ApplyPromoCodeRequest): Observable<ApiResponse<ApplyPromoCodeResponse>> {
    if (!payload) {
      throw new Error('Payload is required');
    }
    if (!payload.code) {
      throw new Error('Code is required');
    }
    if (!payload.priceBefore) {
      throw new Error('Price before is required');
    }
    return this.api.applyPromoCode(payload);
  }

  submitServiceSubmission(formData: FormData): Observable<ApiResponse<any>> {
    if (!formData) {
      throw new Error('FormData payload is required for service submission.');
    }
    return this.api.submitServiceSubmission(formData);
  }

  private validateCheckoutPayload(payload: any): void {
    // If wrapped, use inner object
    const payOrder = payload && payload.payOrder ? payload.payOrder : payload;

    if (!payOrder || typeof payOrder !== 'object') {
      throw new Error('Invalid checkout payload');
    }

    if (!Array.isArray(payOrder.items) || payOrder.items.length === 0) {
      throw new Error('Checkout requires at least one item');
    }

    if (!payOrder.cardToken || typeof payOrder.cardToken !== 'string') {
      throw new Error('Valid card token is required');
    }

    const requiredFields = [
      'firstName',
      'lastName',
      'address',
      'country',
      'state',
      'city',
      'zip',
      'contactInfo',
    ];
    for (const field of requiredFields) {
      if (!payOrder[field]) {
        throw new Error(`Required field missing: ${field}`);
      }
    }

    // Validate items
    payOrder.items.forEach((item: any, index: number) => {
      if (Number(item.price) < 0) {
        throw new Error(`Item ${index + 1} has invalid price`);
      }
      if (Number(item.quantity) < 1) {
        throw new Error(`Item ${index + 1} has invalid quantity`);
      }
      // deliveryType must be number or null
      if (
        item.deliveryType !== null &&
        item.deliveryType !== undefined &&
        isNaN(Number(item.deliveryType))
      ) {
        throw new Error(`Item ${index + 1} has invalid deliveryType`);
      }
    });
  }
}
