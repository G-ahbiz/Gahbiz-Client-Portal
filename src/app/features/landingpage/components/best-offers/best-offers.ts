import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, Input } from '@angular/core';
import { Offer } from '@features/landingpage/interfaces/offer';
import { LandingApiService } from '@features/landingpage/services/landing-api.service';
import { TranslateModule } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { catchError, Observable, of, tap } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { Router } from '@angular/router';
import { CartFacadeService } from '@features/cart/services/cart-facade.service';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { ROUTES } from '@shared/config/constants';
import { FavoriteIconComponent } from '@shared/components/favorite-icon/favorite-icon.component';
import { CopyLinkComponent } from '@shared/components/copy-link/copy-link.component';
import { afterNextRender } from '@angular/core';

@Component({
  selector: 'app-best-offers',
  imports: [TranslateModule, CommonModule, Rating, FavoriteIconComponent, CopyLinkComponent],
  templateUrl: './best-offers.html',
  styleUrl: './best-offers.scss',
})
export class BestOffers implements OnInit {
  @Input() isArabic: boolean = false;
  @Input() isEnglish: boolean = false;
  @Input() isSpanish: boolean = false;

  offers$!: Observable<Offer[]>;
  isLoading: boolean = true;
  error: string = '';

  copiedOfferId: string | null = null;

  private landingApiService = inject(LandingApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private cartFacadeService = inject(CartFacadeService);
  private authService = inject(AuthService);
  readonly isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });

  ngOnInit() {
    this.getOffers();
  }

  getOffers() {
    this.isLoading = true;
    this.error = '';

    this.offers$ = this.landingApiService.getBestOffers().pipe(
      tap(() => {
        this.isLoading = false;
      }),
      catchError((error) => {
        console.error('Error fetching best offers:', error);
        this.error = 'Failed to load best offers';
        this.isLoading = false;
        return of([]);
      }),
    );
  }

  openServiceDetails(id: string): void {
    this.router.navigate(['/service-details', id]);
  }

  onAddToCart(offer: Offer, event: Event): void {
    event.stopPropagation();
    if (!this.isLoggedIn()) {
      this.toastService.error('Please sign in to add items to your cart', 3000);
      return;
    }
    const cartItem: any = {
      id: offer.id,
      name: offer.title,
      description: offer.title,
      price: offer.price,
      priceBefore: offer.priceBefore,
      rate: offer.rating,
      image: offer.imageUrl,
    };
    const result = this.cartFacadeService.addToCart(cartItem as CartItem);
    if (result) {
      this.toastService.success('Item added to cart', 3000);
    } else {
      this.toastService.error('Item already in cart', 3000);
    }
  }

  navigateToAllServices() {
    this.router.navigate([ROUTES.allServices]);
  }
}
