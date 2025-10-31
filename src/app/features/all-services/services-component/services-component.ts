import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ChangeDetectionStrategy,
  OnDestroy,
  signal,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Rating } from '@shared/components/rating/rating';
import { PaginatorModule } from 'primeng/paginator';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgClass } from '@angular/common';
import { PaginatedServices } from '../interfaces/paginated-services';
import { ServiceDetails } from '../interfaces/service-details';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-services-component',
  imports: [TranslateModule, Rating, PaginatorModule, MatIconModule, CommonModule, NgClass],
  templateUrl: './services-component.html',
  styleUrls: ['./services-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent implements OnDestroy {
  private translateService = inject(TranslateService);
  private destroy$ = new Subject<void>();

  // Language state
  readonly currentLang = signal('en');
  readonly isRTL = signal(false);

  // Input properties with type safety
  @Input({ required: true }) serviceList: ServiceDetails[] = [];
  @Input({ required: true }) title: string = '';
  @Input() paginationData: PaginatedServices | null = null;

  @Output() pageChanged = new EventEmitter<{ page: number; pageSize: number }>();

  // Computed properties
  readonly shouldShowPagination = () => this.paginationData && this.paginationData.totalPages > 1;

  readonly getPageSize = (): number => 4;

  ngOnInit() {
    this.initializeTranslation();
  }

  /**
   * Initialize translation with proper error handling
   */
  private initializeTranslation(): void {
    try {
      const savedLang = localStorage.getItem('servabest-language') || 'en';
      this.translateService.setDefaultLang('en');
      this.translateService.use(savedLang);
      this.currentLang.set(savedLang);
      this.isRTL.set(savedLang === 'ar');

      this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe({
        next: (event) => {
          this.currentLang.set(event.lang);
          this.isRTL.set(event.lang === 'ar');
        },
        error: (error) => {
          console.error('Language change error in ServicesComponent:', error);
        },
      });
    } catch (error) {
      console.error('Translation initialization failed in ServicesComponent:', error);
      this.currentLang.set('en');
      this.isRTL.set(false);
    }
  }

  onPreviousPage(): void {
    if (this.paginationData?.hasPreviousPage) {
      this.pageChanged.emit({
        page: this.paginationData.pageNumber - 1,
        pageSize: this.getPageSize(),
      });
    }
  }

  onNextPage(): void {
    if (this.paginationData?.hasNextPage) {
      this.pageChanged.emit({
        page: this.paginationData.pageNumber + 1,
        pageSize: this.getPageSize(),
      });
    }
  }

  // TrackBy function for optimal performance
  trackByServiceId(index: number, service: ServiceDetails): string {
    return service.id;
  }

  // Safe image URL fallback
  getServiceImage(service: ServiceDetails): string {
    return service.image?.path || 'assets/images/placeholder.jpg';
  }

  // Check if service has discount
  hasDiscount(service: ServiceDetails): boolean {
    return service.priceBefore > service.price;
  }

  // Get appropriate chevron direction based on language
  getChevronDirection(direction: 'left' | 'right'): string {
    if (this.currentLang() === 'ar') {
      return direction === 'left' ? 'pi-chevron-right' : 'pi-chevron-left';
    }
    return direction === 'left' ? 'pi-chevron-left' : 'pi-chevron-right';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
