import { Injectable, OnDestroy, computed, effect, EffectRef, signal } from '@angular/core';

export type ThemeChoice = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService implements OnDestroy {
  private readonly storageKey = 'theme';
  private readonly mq =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : (null as MediaQueryList | null);

  readonly themeChoice = signal<ThemeChoice>(this.getStoredChoice());
  readonly isDark = computed(() => this.calculateIsDark());

  // store the EffectRef (not a plain function)
  private effectRef?: EffectRef;
  private mqListener?: (e: MediaQueryListEvent | MediaQueryList) => void;
  private storageListener?: (e: StorageEvent) => void;

  constructor() {
    // apply immediately
    this.applyTheme(this.isDark());

    // store the EffectRef returned from effect()
    this.effectRef = effect(() => {
      const choice = this.themeChoice();
      const dark = this.isDark();
      this.persistChoice(choice);
      this.applyTheme(dark);
    });

    if (this.mq) {
      this.mqListener = (e: MediaQueryListEvent | MediaQueryList) => {
        if (this.themeChoice() === 'system') {
          // computed() will react — applying explicitly is safe
          this.applyTheme(this.isDark());
        }
      };
      if ((this.mq as MediaQueryList).addEventListener) {
        (this.mq as MediaQueryList).addEventListener('change', this.mqListener as EventListener);
      } else {
        (this.mq as MediaQueryList).addListener(this.mqListener as any);
      }
    }

    this.storageListener = (ev: StorageEvent) => {
      if (ev.key === this.storageKey && ev.newValue) {
        const newChoice = ev.newValue as ThemeChoice;
        if (newChoice === 'light' || newChoice === 'dark' || newChoice === 'system') {
          if (this.themeChoice() !== newChoice) this.themeChoice.set(newChoice);
        }
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', this.storageListener);
  }

  ngOnDestroy(): void {
    // destroy the effect properly
    if (this.effectRef) this.effectRef.destroy();

    if (this.mq && this.mqListener) {
      if (this.mq.removeEventListener) {
        this.mq.removeEventListener('change', this.mqListener as EventListener);
      } else {
        (this.mq as any).removeListener(this.mqListener as any);
      }
    }

    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  setTheme(choice: ThemeChoice) {
    this.themeChoice.set(choice);
  }

  toggle() {
    const current = this.themeChoice();
    const effectiveDark = current === 'system' ? !!this.mq?.matches : current === 'dark';
    this.themeChoice.set(effectiveDark ? 'light' : 'dark');
  }

  private getStoredChoice(): ThemeChoice {
    try {
      if (typeof localStorage === 'undefined') return 'light'; //'system';
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    } catch {}
    return 'light'; //'system';
  }

  private persistChoice(choice: ThemeChoice) {
    try {
      // localStorage.setItem(this.storageKey, choice);
    } catch {}
  }

  private calculateIsDark(): boolean {
    const choice = this.themeChoice();
    if (choice === 'system') return !!this.mq?.matches;
    return choice === 'dark';
  }

  private applyTheme(isDark: boolean) {
    const html = typeof document !== 'undefined' ? document.documentElement : null;
    if (!html) return;
    html.classList.remove('light', 'dark');
    html.classList.add(isDark ? 'dark' : 'light');
    html.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
