import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  label = input<string>('');
  loading = input<boolean>(false);
  loadingText = input<string>('');
  disabled = input<boolean>(false);
}
