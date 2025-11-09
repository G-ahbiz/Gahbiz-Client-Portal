import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CartItem } from '@features/cart/interfaces/cart-item';
import { Profile } from '@features/complete-profile/interfaces/profile';
import { ProfileFacadeService } from '@features/complete-profile/services/profile-facade.service';
import { TranslateModule } from '@ngx-translate/core';
import { CART_ITEMS } from '@shared/config/constants';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { ROUTES } from '@shared/config/constants';

@Component({
  selector: 'app-cart-summary',
  imports: [TranslateModule, CommonModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.scss',
})
export class CartSummary implements OnInit, OnDestroy {
  private readonly profileFacade = inject(ProfileFacadeService);
  private readonly toastService = inject(ToastService);

  cartItems = input<CartItem[]>([]);
  profile = {} as Profile;
  isProfileComplete = signal<boolean>(false);

  // Use computed signal for automatic recalculation
  totalPrice = computed(
    () => this.cartItems()?.reduce((total, cartItem) => total + Number(cartItem.price), 0) || 0
  );

  @Input() isButtonDisabled: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadProfile();
  }

  // navigate to complete profile
  navigateToCompleteProfile() {
    this.router.navigate(['/complete-profile']);
  }

  // Load profile and check if it's complete
  private loadProfile() {
    this.profileFacade
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.succeeded && response.data) {
            this.profile = response.data as Profile;
            this.checkProfileComplete();
          } else {
            // Profile not found or incomplete, keep isProfileComplete as false
            this.isProfileComplete.set(false);
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.isProfileComplete.set(false);
        },
      });
  }

  // Proceed to checkout
  proceedToCheckout() {
    // Check if there's an appointment in the cart first
    const hasAppointment = this.cartItems().some(
      (item) => item.id === CART_ITEMS.APPOINTMENT_SERVICE
    );

    // If profile is incomplete, navigate to complete profile
    if (!this.isProfileComplete()) {
      this.toastService.error('Please complete your profile to proceed to checkout');
      this.router.navigate([ROUTES.completeProfile]);
      return;
    }

    // If there's an appointment, navigate to appointment service
    if (hasAppointment) {
      this.router.navigate([ROUTES.appointmentService], {
        queryParams: { returnToCheckout: 'true' },
      });
    } else {
      // Otherwise, proceed to checkout
      this.router.navigate([ROUTES.checkout]);
    }
  }

  private checkProfileComplete() {
    if (
      this.profile.fullName &&
      this.profile.email &&
      this.profile.phoneNumber &&
      this.profile.nationalId &&
      this.profile.dateOfBirth &&
      this.profile.country &&
      this.profile.state &&
      this.profile.postalCode &&
      this.profile.profileImageUrl
    ) {
      this.isProfileComplete.set(true);
    } else {
      this.isProfileComplete.set(false);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
