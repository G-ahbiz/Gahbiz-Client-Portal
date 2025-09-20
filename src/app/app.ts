import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Gahbiz-Client-Portal';
}
