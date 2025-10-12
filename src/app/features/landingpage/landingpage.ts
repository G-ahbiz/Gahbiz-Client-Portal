import { Component } from '@angular/core';
import { Hero } from "@features/landingpage/components/hero/hero";
import { OurServices } from "./components/our-services/our-services";
import { HowItWorks } from "./components/how-it-works/how-it-works";

@Component({
  selector: 'app-landingpage',
  imports: [Hero, OurServices, HowItWorks],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss'
})
export class Landingpage {

}
