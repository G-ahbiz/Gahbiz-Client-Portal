import { Component } from '@angular/core';
import { Hero } from "@features/landingpage/components/hero/hero";
import { OurServices } from "./components/our-services/our-services";

@Component({
  selector: 'app-landingpage',
  imports: [Hero, OurServices],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss'
})
export class Landingpage {

}
