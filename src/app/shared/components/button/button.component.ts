import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() label = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() fullWidth = true;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (this.type === 'button' && !this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
