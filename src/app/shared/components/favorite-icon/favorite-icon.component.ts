import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '@core/services/wishlist.service';
import { catchError, map, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-favorite-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-icon.component.html',
  styleUrls: ['./favorite-icon.component.scss'],
})
export class FavoriteIconComponent implements OnInit, OnDestroy {
  @Input() serviceId!: string;
  isFavorite = false;

  private sub?: Subscription;

  constructor(private wishlistService: WishlistService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.wishlistService.initWishlist();

    this.sub = this.wishlistService.wishlist$.subscribe((ids) => {
      if (ids) {
        const prev = this.isFavorite;
        this.isFavorite = ids.includes(this.serviceId);
        if (prev !== this.isFavorite) {
          this.cd.markForCheck();
        }
      }
    });
  }

  toggleFavorite(event: MouseEvent | Event): void {
    event.stopPropagation();
    if (!this.serviceId) return;

    if (this.isFavorite) {
      this.wishlistService.remove(this.serviceId).subscribe({
        error: (err) => console.error('Remove error', err),
      });
    } else {
      this.wishlistService.add(this.serviceId).subscribe({
        error: (err) => console.error('Add error', err),
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
