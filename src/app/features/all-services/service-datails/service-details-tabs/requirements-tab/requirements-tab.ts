import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-requirements-tab',
  imports: [CommonModule],
  templateUrl: './requirements-tab.html',
  styleUrl: './requirements-tab.scss'
})
export class RequirementsTab {
  requirments: any[] = []

  ngOnInit() {
    this.getRequirments();
  }

  getRequirments() {
    this.requirments = [
      {
        id: 1,
        name: 'Bank Statement',
        description: 'Recent statements from your bank (usually the last 3 months) showing your income deposits and transactions. Download them as PDFs from your online banking account.',
        icon: 'bank.svg',
      },
      {
        id: 2,
        name: 'W-2 Form',
        description: 'A tax form from your employer showing your annual wages and the taxes withheld from your paycheck. You can get it from your HR department or payroll portal.',
        icon: 'form.svg',
      },
      {
        id: 3,
        name: 'Pay Stubs',
        description: 'Your recent pay slips from your employer, typically from the last 1–3 months. They show your gross income and deductions. Often available from your HR or payroll account.',
        icon: 'pay.svg',
      },
      {
        id: 4,
        name: 'Other Income Proof',
        description: 'Any additional document that shows income not covered above — such as freelance invoices, 1099 forms, or rental income statements.',
        icon: 'income.svg',
      },
    ]
  }
}
