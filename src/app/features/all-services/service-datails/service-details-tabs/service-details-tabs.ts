import {
  Component,
  ViewChild,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { HowItWorks } from '@features/landingpage/components/how-it-works/how-it-works';
import { MatTabChangeEvent, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { DescriptionTab } from './description-tab/description-tab';
import { RequirementsTab } from './requirements-tab/requirements-tab';
import { ReviewsTab } from './reviews-tab/reviews-tab';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesDetailsResponse } from '@features/all-services/interfaces/services-details/services-details-response';
import { PrimengFixService } from '@shared/services/primeng-fix.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-service-details-tabs',
  imports: [
    TabsModule,
    CommonModule,
    HowItWorks,
    MatTabsModule,
    DescriptionTab,
    RequirementsTab,
    ReviewsTab,
    TranslateModule,
  ],
  templateUrl: './service-details-tabs.html',
  styleUrl: './service-details-tabs.scss',
})
export class ServiceDetailsTabs implements AfterViewInit {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;
  @Input() service: ServicesDetailsResponse | null = null;

  private readonly tabNames = ['description', 'how-it-works', 'requirements', 'reviews'];

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private primengFix = inject(PrimengFixService);

  ngAfterViewInit() {
    this.route.fragment.pipe(takeUntil(this.destroy$)).subscribe((fragment) => {
      if (fragment && this.tabGroup) {
        const index = this.tabNames.indexOf(fragment);
        if (index > -1 && this.tabGroup.selectedIndex !== index) {
          this.tabGroup.selectedIndex = index;
          this.cd.detectChanges();
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: MatTabChangeEvent): void {
    const fragment = this.tabNames[event.index];
    if (fragment) {
      this.router.navigate([], { fragment, replaceUrl: true });
    }
  }

  onAnimationDone(): void {
    const activeIndex = this.tabGroup.selectedIndex ?? 0;
    const tabName = this.tabNames[activeIndex];

    this.primengFix.fixPrimeNGComponents();
    this.cd.detectChanges();

    if (tabName === 'reviews') {
      this.primengFix.fixRatingComponents();
      window.dispatchEvent(new Event('resize'));
    }
  }
}
