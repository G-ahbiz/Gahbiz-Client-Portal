import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-step3-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './step3-confirmation.html',
  styleUrls: ['./step3-confirmation.scss'],
})
export class Step3Confirmation implements OnInit, AfterViewInit {
  orderId: string | null = null;

  @ViewChild('confirmationCard') confirmationCard!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('orderId');

    if (!this.orderId) {
      this.router.navigate(['/home']);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.confirmationCard?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 200);
  }
}
