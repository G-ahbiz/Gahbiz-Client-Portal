import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  imports: [CommonModule, TranslateModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
})
export class LanguageSwitcherComponent {
  private readonly langService = inject(LanguageService);

  readonly currentLang = computed(() => this.langService.currentLang());

  isOpen = signal(false);
  private clickListener: ((event: MouseEvent) => void) | null = null;

  languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  toggleDropdown() {
    this.isOpen.update(open => !open);
    
    if (this.isOpen()) {
      setTimeout(() => {
        this.clickListener = (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (!target.closest('.language-switcher')) {
            this.isOpen.set(false);
            this.removeClickListener();
          }
        };
        document.addEventListener('click', this.clickListener);
      }, 0);
    } else {
      this.removeClickListener();
    }
  }

  setLanguage(lang: string) {
    this.langService.use(lang);
    this.isOpen.set(false);
    this.removeClickListener();
  }

  switch(lang: string) {
    this.langService.use(lang);
  }

  private removeClickListener() {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
      this.clickListener = null;
    }
  }

  ngOnDestroy() {
    this.removeClickListener();
  }
}
