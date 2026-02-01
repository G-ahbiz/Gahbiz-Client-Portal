import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ROUTES } from '@shared/config/constants';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [TranslateModule, RouterLink, NgOptimizedImage],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly ROUTES = ROUTES;

  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
