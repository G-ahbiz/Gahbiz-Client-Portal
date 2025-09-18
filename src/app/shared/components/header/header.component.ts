import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ThemeToggleDirective } from '../../directives/theme-toggle.directive';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from "../theme-toggle/theme-toggle.component";
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { TranslateModule } from '@ngx-translate/core';
import { ROUTES } from "../../config/constants"

@Component({
  selector: 'app-header',
  imports: [ThemeToggleDirective, RouterLink, ThemeToggleComponent, NgClass, LanguageSwitcherComponent, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  readonly ROUTES = ROUTES;

  private themeService = inject(ThemeService);

  isMenuOpen = signal(false);
  isDark = this.themeService.isDark;

  constructor(
    private router: Router,
  ) {}

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu() {
    this.isMenuOpen.set(false);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.closeMenu();
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
