import { Component, EventEmitter, input, Input, OnInit, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-button',
  imports: [MatIconModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  label = input<string>('');
  loading = input<boolean>(false);
  loadingText = input<string>('');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit'>('button');
  fullWidth = input<boolean>(true);
  clicked = new EventEmitter<void>();

  onClick() {
    if (this.type() === 'button' && !this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}
