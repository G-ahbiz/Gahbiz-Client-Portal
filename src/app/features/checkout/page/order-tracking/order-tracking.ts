import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TrackingBar } from '../../components/tracking-bar/tracking-bar';
import { OrderServices } from '../../components/order-services/order-services';
import { CheckoutFacadeService } from '../../services/checkout-facade.service';
import { Order } from '../../interfaces/order';
import { OrderItem } from '../../interfaces/order-item';

@Component({
  selector: 'app-order-tracking',
  imports: [CommonModule, TranslateModule, TrackingBar, OrderServices],
  templateUrl: './order-tracking.html',
  styleUrl: './order-tracking.scss',
})
export class OrderTracking implements OnInit, OnDestroy {
  // Signals
  orderId = signal<string>('');
  currentTrackingStage = signal<number>(0);
  orderStatus = signal<string>('received');
  order = signal<Order | null>(null);
  orderItems = signal<OrderItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');

  // Computed signals
  isOrderPaid = computed(() => {
    const status = this.orderStatus().toLowerCase();
    const paidStatuses = ['paid', 'pending', 'processing', 'completed'];
    return paidStatuses.includes(status);
  });

  statusMessage = computed(() => {
    const status = this.orderStatus().toLowerCase();
    switch (status) {
      case 'created':
        return 'checkout.tracking.status-created';
      case 'cancelled':
        return 'checkout.tracking.status-cancelled';
      case 'refunded':
        return 'checkout.tracking.status-refunded';
      default:
        return '';
    }
  });

  statusClass = computed(() => {
    const status = this.orderStatus().toLowerCase();
    switch (status) {
      case 'created':
        return 'alert-info';
      case 'cancelled':
        return 'alert-warning';
      case 'refunded':
        return 'alert-danger';
      default:
        return 'alert-info';
    }
  });

  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private checkoutFacade: CheckoutFacadeService) {}

  ngOnInit() {
    // Get order ID from route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params['orderId'] || '';
      this.orderId.set(id);
      if (id && id !== 'N/A') {
        this.fetchOrderDetails(id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchOrderDetails(orderId: string) {
    console.log('fetchOrderDetails called with orderId:', orderId);
    this.loading.set(true);
    this.error.set('');
    console.log('Loading set to true, about to call API...');

    this.checkoutFacade
      .getOrderById(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          console.log('Loading set to false in next callback');

          if (response && response.succeeded && response.data) {
            this.order.set(response.data);
            this.orderItems.set(response.data.orderItems || []);
            // Capitalize first letter of status
            const rawStatus = response.data.status || 'Created';
            this.orderStatus.set(this.capitalizeFirstLetter(rawStatus));
            this.updateTrackingStage();
            console.log('✅ Order loaded successfully');
          } else {
            this.error.set(response?.message || 'Failed to load order details');
            console.error('❌ Failed to load order - response not successful:', response);
          }
        },
        error: (err) => {
          console.error('❌ Error fetching order:', err);
          this.loading.set(false);
          console.log('Loading set to false in error callback');
          this.error.set('Failed to load order details. Please try again.');
        },
      });
  }

  updateTrackingStage() {
    // Map order status to tracking stage
    // Statuses: Created, Paid, Pending, Processing, Completed, Cancelled, Refunded
    // Stages: 0 = Pending, 1 = Processing, 2 = Completed
    const status = this.orderStatus().toLowerCase();

    switch (status) {
      case 'created':
      case 'paid':
      case 'pending':
        this.currentTrackingStage.set(0); // Pending
        break;
      case 'processing':
        this.currentTrackingStage.set(1); // Processing
        break;
      case 'completed':
        this.currentTrackingStage.set(2); // Completed
        break;
      case 'cancelled':
      case 'refunded':
        this.currentTrackingStage.set(0); // Show as pending but will display special message
        break;
      default:
        this.currentTrackingStage.set(0); // Pending
        break;
    }
  }

  capitalizeFirstLetter(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
