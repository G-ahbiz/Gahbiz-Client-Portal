import { ChangeDetectionStrategy, Component, model, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { AllServicesComponentService, serviceDatailsInfo } from '@shared/services/all-services-component';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RelatedServices } from "../service-datails/related-services/related-services";
import { Navbar } from "@shared/components/navbar/navbar";
import { Footer } from "@shared/components/footer/footer";

@Component({
  selector: 'app-appointment-service-component',
  imports: [TranslateModule, Breadcrumb, FormsModule, MatCardModule, MatDatepickerModule, RelatedServices, Navbar, Footer],
  templateUrl: './appointment-service-component.html',
  styleUrl: './appointment-service-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()]
})
export class AppointmentServiceComponent implements OnInit {

  // Language
  isArabic: boolean = false;
  isEnglish: boolean = false;
  isSpanish: boolean = false;

  // breadcrumb
  items: MenuItem[] = [{ label: 'Home', routerLink: '/home' }];
  home: MenuItem | undefined;


  // service details
  serviceDetails: serviceDatailsInfo[] = [];

  // appointment service date
  selected = model<Date | null>(null);

  // appointment service form
  appointmentServiceForm: FormGroup;

  constructor(private translateService: TranslateService, private allServicesService: AllServicesComponentService, private formBuilder: FormBuilder) {
    this.appointmentServiceForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    });
  }

  ngOnInit() {
    this.initializeTranslation();

    // service details
    this.getServiceDetails();

    // breadcrumb Home Icon
    this.home = { icon: 'pi pi-home', routerLink: '/home' };

    // update breadcrumb
    this.updateBreadcrumb();
  }

  // Initialize translation
  private initializeTranslation() {
    // Set default language if not already set
    if (!localStorage.getItem('servabest-language')) {
      localStorage.setItem('servabest-language', 'en');
    }

    // Get saved language and set it
    const savedLang = localStorage.getItem('servabest-language') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(savedLang);
    if (savedLang === 'en' || savedLang === 'sp') {
      document.documentElement.style.direction = 'ltr';
    } else if (savedLang === 'ar') {
      document.documentElement.style.direction = 'rtl';
    }

    // Set initial language state
    this.isArabic = savedLang === 'ar';
    this.isEnglish = savedLang === 'en';
    this.isSpanish = savedLang === 'sp';
    // Subscribe to language changes
    this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.isArabic = event.lang === 'ar';
      this.isEnglish = event.lang === 'en';
      this.isSpanish = event.lang === 'sp';
    });
  }

  // update breadcrumb
  updateBreadcrumb() {
    this.items = [{ label: 'Our Services', routerLink: '/all-services' }];
    const activeServiceList = this.allServicesService.getActiveServiceList();
    if (activeServiceList != 1) {
      let activeServiceTitle = this.isArabic ? this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceAr : this.isEnglish ? this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceEn : this.allServicesService.servicesListTitles?.find(service => service.id === activeServiceList)?.serviceSp;
      this.items?.push({ label: activeServiceTitle, routerLink: '' });
    }
  }

  // get service details
  getServiceDetails() {
    this.serviceDetails = this.allServicesService.seviceDetails;
  }

}
