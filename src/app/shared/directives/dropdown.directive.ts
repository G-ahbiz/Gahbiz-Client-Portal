import { Directive, ElementRef, HostListener, Renderer2, OnDestroy, signal } from '@angular/core';

@Directive({
  selector: '[appDropdown]',
  standalone: true,
})
export class DropdownDirective implements OnDestroy {
  private isOpen = signal(false);
  private clickListener?: () => void;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  @HostListener('click', ['$event'])
  toggleDropdown(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const currentState = this.isOpen();

    // Close all other dropdowns first
    this.closeAllDropdowns();

    if (!currentState) {
      this.openDropdown();
    }
  }

  private openDropdown() {
    const dropdownMenu = this.el.nativeElement.nextElementSibling;

    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
      // Show the dropdown
      this.renderer.addClass(dropdownMenu, 'show');
      this.el.nativeElement.setAttribute('aria-expanded', 'true');
      this.isOpen.set(true);

      // Position the dropdown menu
      this.positionDropdown(dropdownMenu);

      // Listen for clicks outside
      setTimeout(() => {
        this.clickListener = this.renderer.listen('document', 'click', () => {
          this.closeDropdown();
        });
      }, 0);
    }
  }

  private positionDropdown(dropdownMenu: HTMLElement) {
    const toggle = this.el.nativeElement;
    const rect = toggle.getBoundingClientRect();
    const menuRect = dropdownMenu.getBoundingClientRect();
    const hasEnd = dropdownMenu.classList.contains('dropdown-menu-end');

    // Reset positioning
    this.renderer.setStyle(dropdownMenu, 'position', 'absolute');
    this.renderer.setStyle(dropdownMenu, 'top', '100%');
    this.renderer.setStyle(dropdownMenu, 'left', hasEnd ? 'auto' : '0');
    this.renderer.setStyle(dropdownMenu, 'right', hasEnd ? '0' : 'auto');
    this.renderer.setStyle(dropdownMenu, 'transform', 'translate(0, 0)');

    // Check if dropdown would go off screen and adjust if needed
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if needed
    if (hasEnd) {
      const rightEdge = rect.right;
      if (rightEdge < menuRect.width) {
        this.renderer.setStyle(dropdownMenu, 'right', 'auto');
        this.renderer.setStyle(dropdownMenu, 'left', '0');
      }
    } else {
      const leftEdge = rect.left + menuRect.width;
      if (leftEdge > viewportWidth) {
        this.renderer.setStyle(dropdownMenu, 'left', 'auto');
        this.renderer.setStyle(dropdownMenu, 'right', '0');
      }
    }

    // Adjust vertical position if needed (drop up if not enough space below)
    const bottomEdge = rect.bottom + menuRect.height;
    if (bottomEdge > viewportHeight && rect.top > menuRect.height) {
      this.renderer.setStyle(dropdownMenu, 'top', 'auto');
      this.renderer.setStyle(dropdownMenu, 'bottom', '100%');
    }
  }

  private closeDropdown() {
    const dropdownMenu = this.el.nativeElement.nextElementSibling;

    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
      this.renderer.removeClass(dropdownMenu, 'show');
      this.el.nativeElement.setAttribute('aria-expanded', 'false');
      this.isOpen.set(false);

      if (this.clickListener) {
        this.clickListener();
        this.clickListener = undefined;
      }
    }
  }

  private closeAllDropdowns() {
    const allDropdowns = document.querySelectorAll('.dropdown-menu.show');
    allDropdowns.forEach((menu) => {
      this.renderer.removeClass(menu, 'show');
      const toggle = menu.previousElementSibling;
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.clickListener();
    }
  }
}
