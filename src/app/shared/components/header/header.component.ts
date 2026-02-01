import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { ThemeToggleDirective } from '../../directives/theme-toggle.directive';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES } from '../../config/constants';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [ThemeToggleDirective, RouterLink, NgClass, TranslateModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // Ziad : TODO : fix header transition

  readonly ROUTES = ROUTES;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  isMenuOpen = signal(false);
  isDark = this.themeService.isDark;
  isLoggedIn = toSignal(this.authService.isLoggedIn$, {
    initialValue: this.authService.isAuthenticated(),
  });

  constructor(private router: Router) {}

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeMenu();
  }

  logout() {
    this.authService.logout();
    this.navigateTo('/');
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
