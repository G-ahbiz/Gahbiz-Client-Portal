import { Component } from '@angular/core';
import { Navbar } from "../navbar/navbar";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-terms',
  imports: [Navbar, Footer],
  templateUrl: './terms.html',
  styleUrl: './terms.scss'
})
export class Terms {

}
