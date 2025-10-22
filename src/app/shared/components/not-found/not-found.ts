import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [TranslateModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFound {
  constructor(private router: Router) { }

  goBack() {
    window.history.back();
  }
}
