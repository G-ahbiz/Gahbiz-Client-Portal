import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

@Directive({
  selector: '[appThemeToggle]',
})
export class ThemeToggleDirective {
  @Input('appThemeToggle') toggleType: 'switch' | 'set-light' | 'set-dark' | 'set-system' =
    'switch';

  constructor(private theme: ThemeService) {}

  @HostBinding('attr.aria-pressed')
  get pressed(): 'true' | 'false' {
    return this.theme.isDark() ? 'true' : 'false';
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string {
    return this.theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  }

  @HostListener('click')
  onClick() {
    switch (this.toggleType) {
      case 'set-light':
        this.theme.setTheme('light');
        break;
      case 'set-dark':
        this.theme.setTheme('dark');
        break;
      case 'set-system':
        this.theme.setTheme('system');
        break;
      default:
        this.theme.toggle();
        break;
    }
  }
}
