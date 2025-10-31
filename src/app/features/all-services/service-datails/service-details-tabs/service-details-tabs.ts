import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
import { HowItWorks } from "@features/landingpage/components/how-it-works/how-it-works";
import { MatTabsModule } from '@angular/material/tabs';
import { DescriptionTab } from "./description-tab/description-tab";
import { RequirementsTab } from "./requirements-tab/requirements-tab";
import { ReviewsTab } from "./reviews-tab/reviews-tab";

@Component({
  selector: 'app-service-details-tabs',
  imports: [TabsModule, CommonModule, HowItWorks, MatTabsModule, DescriptionTab, RequirementsTab, ReviewsTab],
  templateUrl: './service-details-tabs.html',
  styleUrl: './service-details-tabs.scss'
})
export class ServiceDetailsTabs {

}
