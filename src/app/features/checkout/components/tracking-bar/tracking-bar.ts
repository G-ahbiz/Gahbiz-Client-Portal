import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface TrackingStage {
  id: string;
  label: string;
  iconPath: string;
  date: string | null;
  status: 'completed' | 'current' | 'pending';
}

@Component({
  selector: 'app-tracking-bar',
  imports: [CommonModule, TranslateModule],
  templateUrl: './tracking-bar.html',
  styleUrl: './tracking-bar.scss',
})
export class TrackingBar implements OnChanges {
  @Input() currentStage: number = 0; // Current stage index (0-based)
  @Input() orderCreatedDate: string | null = null; // Order creation date
  @Input() orderStatus: string = 'received'; // Order status

  stages: TrackingStage[] = [
    {
      id: 'pending',
      label: 'checkout.tracking.pending',
      iconPath: 'bi bi-clock-history',
      date: null,
      status: 'completed',
    },
    {
      id: 'processing',
      label: 'checkout.tracking.processing',
      iconPath: 'bi bi-hourglass-split',
      date: null,
      status: 'pending',
    },
    {
      id: 'completed',
      label: 'checkout.tracking.completed',
      iconPath: 'bi bi-check-circle',
      date: null,
      status: 'pending',
    },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentStage'] || changes['orderCreatedDate'] || changes['orderStatus']) {
      this.updateStageStatus();
      this.updateStageDates();
    }
  }

  updateStageStatus() {
    this.stages.forEach((stage, index) => {
      if (index < this.currentStage) {
        stage.status = 'completed';
      } else if (index === this.currentStage) {
        stage.status = 'current';
      } else {
        stage.status = 'pending';
      }
    });
  }

  updateStageDates() {
    if (this.orderCreatedDate) {
      const createdDate = new Date(this.orderCreatedDate);

      // Set date for pending stage (order creation date)
      this.stages[0].date = this.formatDate(createdDate);

      // Set dates for other stages based on current stage
      if (this.currentStage >= 1) {
        const processingDate = new Date(createdDate);
        processingDate.setDate(processingDate.getDate() + 1);
        this.stages[1].date = this.formatDate(processingDate);
      }

      if (this.currentStage >= 2) {
        const completedDate = new Date();
        this.stages[2].date = this.formatDate(completedDate);
      }
    }
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  }
}
