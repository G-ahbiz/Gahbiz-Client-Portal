import { Component, OnInit } from '@angular/core';
import { SignInFormComponent } from '../../components/sign-in/sign-in-form/sign-in-form.component';

@Component({
  selector: 'app-sign-in-page',
  imports: [SignInFormComponent],
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss'],
})
export class SignInPageComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
