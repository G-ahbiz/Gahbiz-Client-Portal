// Minimal Bootstrap modal functionality without the full bundle
export class BootstrapModal {
  private modalElement: HTMLElement;
  private backdropElement: HTMLDivElement | null = null;

  constructor(modalId: string) {
    const element = document.getElementById(modalId);
    if (!element) {
      throw new Error(`Modal element with id "${modalId}" not found`);
    }
    this.modalElement = element;
  }

  show(): void {
    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'modal-backdrop fade show';
    document.body.appendChild(this.backdropElement);

    // Show modal
    this.modalElement.classList.add('show');
    this.modalElement.style.display = 'block';
    this.modalElement.setAttribute('aria-modal', 'true');
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.removeAttribute('aria-hidden');
    document.body.classList.add('modal-open');

    // Add fade animation
    setTimeout(() => {
      this.modalElement.classList.add('show');
    }, 10);

    // Close on backdrop click
    this.backdropElement.addEventListener('click', () => this.hide());

    // Close on ESC key
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    // Close on close button click
    const closeButtons = this.modalElement.querySelectorAll('[data-bs-dismiss="modal"]');
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.hide());
    });
  }

  hide(): void {
    // Hide modal
    this.modalElement.classList.remove('show');

    setTimeout(() => {
      this.modalElement.style.display = 'none';
      this.modalElement.setAttribute('aria-hidden', 'true');
      this.modalElement.removeAttribute('aria-modal');
      this.modalElement.removeAttribute('role');

      // Remove backdrop
      if (this.backdropElement) {
        this.backdropElement.remove();
        this.backdropElement = null;
      }

      document.body.classList.remove('modal-open');
    }, 300); // Match Bootstrap's transition time
  }
}
