import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';

interface GalleryImage {
  itemImageSrc: string;
  thumbnailImageSrc: string;
  alt: string;
}

@Component({
  selector: 'app-custom-gallery',
  templateUrl: './custom-gallery.component.html',
  styleUrls: ['./custom-gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomGalleryComponent implements OnChanges, AfterViewInit {
  @Input() images: string[] = [];
  @Input() altText: string = 'Service image';
  @Input() offerId!: string;

  galleryImages: GalleryImage[] = [];
  selectedImage: GalleryImage | null = null;

  @ViewChild('thumbnailScroller') thumbnailScroller!: ElementRef<HTMLDivElement>;

  copiedOfferId: string | null = null;
  canScrollLeft = false;
  canScrollRight = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images'] && this.images?.length > 0) {
      this.galleryImages = this.images.map((src) => ({
        itemImageSrc: src,
        thumbnailImageSrc: src,
        alt: this.altText,
      }));
      this.selectedImage = this.galleryImages[0];
    }

    if (changes['altText'] && this.galleryImages.length > 0) {
      this.galleryImages.forEach((img) => (img.alt = this.altText));
      if (this.selectedImage) this.selectedImage.alt = this.altText;
    }

    this.cdr.markForCheck();
  }

  ngAfterViewInit(): void {
    const scroller = this.thumbnailScroller.nativeElement;
    scroller.addEventListener('scroll', () => this.updateScrollButtons());
    this.updateScrollButtons();
    this.cdr.detectChanges();
  }

  updateScrollButtons(): void {
    const scroller = this.thumbnailScroller?.nativeElement;
    if (!scroller) return;

    this.canScrollLeft = scroller.scrollLeft > 5;
    this.canScrollRight = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 5;
    this.cdr.markForCheck();
  }

  scrollThumbnails(direction: 'left' | 'right'): void {
    const scroller = this.thumbnailScroller.nativeElement;
    const scrollAmount = scroller.clientWidth * 0.7;

    scroller.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });

    setTimeout(() => this.updateScrollButtons(), 400);
  }

  selectImage(image: GalleryImage): void {
    this.selectedImage = image;
    this.cdr.markForCheck();
  }

  nextImage(): void {
    if (!this.selectedImage || !this.galleryImages.length) return;
    const i = this.galleryImages.indexOf(this.selectedImage);
    this.selectedImage = this.galleryImages[(i + 1) % this.galleryImages.length];
    this.cdr.markForCheck();
  }

  prevImage(): void {
    if (!this.selectedImage || !this.galleryImages.length) return;
    const i = this.galleryImages.indexOf(this.selectedImage);
    this.selectedImage =
      this.galleryImages[(i - 1 + this.galleryImages.length) % this.galleryImages.length];
    this.cdr.markForCheck();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollButtons();
  }

  putInFavorites(id: string) {
    console.log('Add to favorites:', id);
    // Add your favorite API logic here
  }

  copyPageUrl(offerId: string) {
    if (!offerId || this.copiedOfferId === offerId) return;

    const baseUrl = window.location.origin;
    const serviceUrl = `${baseUrl}/services/${offerId}`;

    navigator.clipboard.writeText(serviceUrl).then(
      () => {
        this.copiedOfferId = offerId;
        const message = this.translate.instant('best-offers.toasts.url-copied') || 'URL copied!';
        this.toast.success(message);

        this.cdr.markForCheck();

        // reset after 2s
        setTimeout(() => {
          this.copiedOfferId = null;
          this.cdr.markForCheck();
        }, 2000);
      },
      () => {
        const msg = this.translate.instant('best-offers.toasts.url-copy-failed') || 'Copy failed!';
        this.toast.error(msg);
      }
    );
  }
}
