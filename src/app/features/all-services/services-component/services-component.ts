import { Component, Input, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';

@Component({
  selector: 'app-services-component',
  imports: [TranslateModule, Rating],
  templateUrl: './services-component.html',
  styleUrl: './services-component.scss'
})
export class ServicesComponent implements OnInit {

  @Input() serviceList: any[] | undefined;
  @Input() title: string = '';


  ngOnInit() { }

}
