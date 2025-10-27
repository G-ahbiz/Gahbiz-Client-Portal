import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-summary',
  imports: [TranslateModule, CommonModule],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.scss'
})
export class CartSummary {

}
