import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-social-sign-up',
  imports: [CommonModule, TranslateModule],
  templateUrl: './social-sign-up.component.html',
  styleUrls: ['./social-sign-up.component.scss'],
})
export class SocialSignUpComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
