import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { Subject } from 'rxjs';
import { WishlistService } from '@core/services/wishlist.service';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { DropdownDirective } from '@shared/directives/dropdown.directive';

@Component({
  selector: 'app-cart-cards',
  imports: [TranslateModule, Rating, PaginatorModule, CommonModule, DropdownDirective],
  templateUrl: './cart-cards.html',
  styleUrl: './cart-cards.scss',
})
export class CartCards implements OnInit, OnChanges, OnDestroy {
  // Pagination state
  currentPage: number = 1;
  pageSize: number = 2;
  totalPages: number[] = [];

  @Input() cartItems: CartItem[] = [];
  @Output() cartItemsChanged = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private wishlistService: WishlistService,
    private toast: ToastService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.updateTotalPages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cartItems'] && !changes['cartItems'].firstChange) {
      // Reset to first page if current page is out of bounds
      const totalPages = this.getTotalPages();
      if (this.currentPage > totalPages && totalPages > 0) {
        this.currentPage = totalPages;
      } else if (totalPages === 0) {
        this.currentPage = 1;
      }
      this.updateTotalPages();
    }
  }

  // navigate to service details
  removeFromCart(serviceId: string) {
    this.cartItemsChanged.emit(serviceId);
  }

  saveForLater(serviceId: string) {
    this.wishlistService.add(serviceId).subscribe({
      next: (added) => {
        if (added) {
          const msg = this.translate.instant('cart.cards.saved-for-later-toast');
          this.toast.success(msg || 'Saved for later');

          // Remove from cart only if added
          this.cartItemsChanged.emit(serviceId);
        } else {
          const msg = this.translate.instant('cart.cards.already-saved-toast');
          this.toast.info(msg || 'Item already saved for later');
        }
      },
      error: (err) => {
        console.error('Save for later error:', err);
        const msg = this.translate.instant('cart.cards.save-for-later-failed');
        this.toast.error(msg || 'Failed to save for later');
      },
    });
  }

  // navigate to home
  navigateToHome() {
    this.router.navigate(['/all-services']);
  }

  // get total pages
  getTotalPages() {
    if (!this.cartItems || this.cartItems.length === 0) return 0;
    return Math.ceil(this.cartItems.length / this.pageSize);
  }
  // get current page
  getCurrentPage() {
    return this.currentPage;
  }
  // get page size
  getPageSize() {
    return this.pageSize;
  }

  // get paginated cart items for current page
  getPaginatedCartItems() {
    if (!this.cartItems || this.cartItems.length === 0) return [];

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.cartItems.slice(startIndex, endIndex);
  }

  // update total pages array
  private updateTotalPages() {
    const totalPages = this.getTotalPages();
    this.totalPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // on page change with validation
  onPageChange(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  // on previous page with validation
  onPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // on next page with validation
  onNextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // on page size change
  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateTotalPages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
