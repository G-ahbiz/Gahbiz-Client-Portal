import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-empty-cart',
  imports: [TranslateModule, CommonModule, RouterLink],
  templateUrl: './empty-cart.html',
  styleUrl: './empty-cart.scss',
})
export class EmptyCart {}
