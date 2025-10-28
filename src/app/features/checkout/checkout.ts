import { Component } from '@angular/core';
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";

@Component({
  selector: 'app-checkout',
  imports: [Navbar, Footer],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout {

}
