import { Component } from '@angular/core';
import { Hero } from "@features/landingpage/components/hero/hero";
import { OurServices } from "./components/our-services/our-services";
import { HowItWorks } from "./components/how-it-works/how-it-works";
import { BestOffers } from "./components/best-offers/best-offers";
import { Testimonials } from "./components/testimonials/testimonials";

@Component({
  selector: 'app-landingpage',
  imports: [Hero, OurServices, HowItWorks, BestOffers, Testimonials],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss'
})
export class Landingpage {

}
