import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepPathMobile } from "./step-path-mobile/step-path-mobile";
import { StepPathPc } from "./step-path-pc/step-path-pc";

@Component({
  selector: 'app-how-it-works',
  imports: [TranslateModule, StepPathMobile, StepPathPc],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.scss'
})
export class HowItWorks {

}
