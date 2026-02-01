import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

interface Step {
  id: number;
  translationKey: string;
  iconColor: 'primary' | 'orange';
  ariaLabel: string;
}

@Component({
  selector: 'app-step-path-mobile',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './step-path-mobile.html',
  styleUrl: './step-path-mobile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepPathMobile {
  readonly steps: Step[] = [
    { id: 1, translationKey: 'how-it-works.step1', iconColor: 'primary', ariaLabel: 'Step 1: Browse Services' },
    { id: 2, translationKey: 'how-it-works.step2', iconColor: 'orange', ariaLabel: 'Step 2: Upload Documents' },
    { id: 3, translationKey: 'how-it-works.step3', iconColor: 'primary', ariaLabel: 'Step 3: Verify Account' },
    { id: 4, translationKey: 'how-it-works.step4', iconColor: 'orange', ariaLabel: 'Step 4: Complete Order' },
  ];

  trackByStepId(index: number, step: Step): number {
    return step.id;
  }
}
