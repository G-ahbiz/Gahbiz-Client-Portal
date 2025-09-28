import { Component, EventEmitter, OnInit, output, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-social-sign',
  imports: [CommonModule, TranslateModule],
  templateUrl: './social-sign.component.html',
  styleUrls: ['./social-sign.component.scss'],
})
export class SocialSignComponent implements OnInit {
  onGoogleRegister = output<void>();
  onFacebookRegister = output<void>();

  constructor() {}

  ngOnInit() {}
}
