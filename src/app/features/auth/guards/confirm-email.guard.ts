import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { SignUpResponseStorageService } from '@features/auth/services/sign-up/sign-up-response-storage.service';
import { ROUTES } from '@shared/config/constants';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ConfirmEmailGuard implements CanActivate {
  constructor(
    private storage: SignUpResponseStorageService,
    private router: Router,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    // If storage already has the essential data, allow
    if (this.storage.userId && this.storage.email) {
      return true;
    }

    // If the user came through an email link with userId + token, populate storage and allow
    const query = route.queryParamMap;
    const userId = query.get('userId');
    const token = query.get('token');
    const email = query.get('email') ?? undefined;

    if (userId && token) {
      this.storage.populateFromQueryParams(userId, email, token);
      return true;
    }

    // Otherwise block and redirect to sign-in with message
    this.toast.error(this.translate.instant('CONFIRM_EMAIL.MESSAGES.BLOCKED'));
    return this.router.parseUrl(ROUTES.signIn);
  }
}
