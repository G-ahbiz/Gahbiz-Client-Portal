import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OrderItem } from '../../interfaces/order-item';

@Component({
  selector: 'app-order-services',
  imports: [CommonModule, TranslateModule, CurrencyPipe],
  templateUrl: './order-services.html',
  styleUrl: './order-services.scss',
})
export class OrderServices implements OnInit {
  @Input() orderItems: OrderItem[] = [];

  services: OrderItem[] = [];

  placeholderImage = 'assets/images/placeholder.jpg';

  ngOnInit() {
    if (this.orderItems && this.orderItems.length > 0) {
      this.services = this.orderItems;
    }
  }

  getGrandTotal(): number {
    return this.services.reduce((sum, service) => sum + service.total, 0);
  }

  getImageUrl(service: OrderItem): string {
    return service.itemImageUrl || this.placeholderImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.placeholderImage;
  }
}
