import { Component } from '@angular/core';
import { Hero } from "@features/landingpage/components/hero/hero";

@Component({
  selector: 'app-landingpage',
  imports: [Hero],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.scss'
})
export class Landingpage {

}
