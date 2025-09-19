import { Component, ElementRef, inject, OnDestroy, signal } from '@angular/core';
import { ThemeChoice, ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [],
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent implements OnDestroy {
  private themeService = inject(ThemeService);
  private el = inject(ElementRef<HTMLElement>);

  // UI state
  isOpen = signal(false);
  focusedIndex = signal<number | null>(null);

  readonly options: { key: ThemeChoice; label: string; icon: string }[] = [
    { key: 'light', label: 'Light', icon: 'sun' },
    { key: 'dark', label: 'Dark', icon: 'moon' },
    { key: 'system', label: 'System', icon: 'computer' },
  ];

  // Theme state
  get themeChoice() {
    return this.themeService.themeChoice;
  }

  get isDark() {
    return this.themeService.isDark;
  }

  // Toggle theme on single click
  toggleTheme() {
    this.themeService.toggle();
  }

  // Open/close panel
  togglePanel(event?: Event) {
    if (event) {
      event.stopPropagation(); // Prevent event from bubbling to document
    }

    this.isOpen.update((open) => !open);

    if (this.isOpen()) {
      // Add a small delay to ensure the DOM is updated
      setTimeout(() => {
        this.focusOption(0);
        this.addGlobalListeners();
      }, 10);
    } else {
      this.focusedIndex.set(null);
      this.removeGlobalListeners();
      this.focusToggleButton();
    }
  }

  // Choose theme & close panel
  setTheme(choice: ThemeChoice, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.themeService.setTheme(choice);
    this.closePanel();
  }

  // Close panel only
  closePanel() {
    this.isOpen.set(false);
    this.focusedIndex.set(null);
    this.removeGlobalListeners();
    this.focusToggleButton();
  }

  // Keyboard & focus helpers
  private focusToggleButton() {
    try {
      const btn = this.el.nativeElement.querySelector('.theme-toggle-button') as HTMLElement | null;
      btn?.focus();
    } catch {}
  }

  private focusOption(index: number) {
    const list = this.el.nativeElement.querySelectorAll('.theme-option') as NodeListOf<HTMLElement>;
    if (!list || list.length === 0) return;
    const idx = Math.max(0, Math.min(index, list.length - 1));
    const el = list[idx];
    el?.focus();
    this.focusedIndex.set(idx);
  }

  // Move focus with arrow keys
  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isOpen()) return;
    const len = this.options.length;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.closePanel();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (this.focusedIndex() ?? -1) + 1;
      this.focusOption(next % len);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = (this.focusedIndex() ?? 0) - 1;
      this.focusOption((idx + len) % len);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = this.focusedIndex();
      if (idx != null) {
        const opt = this.options[idx];
        this.setTheme(opt.key);
      }
    }

    // Tab key should work normally but close when tabbing out
    if (e.key === 'Tab' && !e.shiftKey) {
      const list = this.el.nativeElement.querySelectorAll(
        '.theme-option'
      ) as NodeListOf<HTMLElement>;
      if (this.focusedIndex() === list.length - 1) {
        // Last element, close on next tab
        setTimeout(() => {
          if (!this.el.nativeElement.contains(document.activeElement)) {
            this.closePanel();
          }
        }, 10);
      }
    }
  };

  // Click outside closes panel
  private onDocClick = (e: MouseEvent) => {
    const target = e.target as Node | null;
    if (!target || !this.el.nativeElement.contains(target)) {
      this.closePanel();
    }
  };

  private addGlobalListeners() {
    if (typeof document === 'undefined') return;
    // Use capture phase to ensure we catch events first
    document.addEventListener('click', this.onDocClick, true);
    window.addEventListener('keydown', this.onKeyDown, true);
  }

  private removeGlobalListeners() {
    if (typeof document === 'undefined') return;
    document.removeEventListener('click', this.onDocClick, true);
    window.removeEventListener('keydown', this.onKeyDown, true);
  }

  ngOnDestroy(): void {
    this.removeGlobalListeners();
  }
}
