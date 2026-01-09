import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './rating.html',
  styleUrl: './rating.scss'
})
export class Rating {

  @Input() rating = 0;
}
