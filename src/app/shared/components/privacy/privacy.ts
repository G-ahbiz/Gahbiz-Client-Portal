import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-privacy',
  imports: [Navbar, Footer],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss'
})
export class Privacy {

}
