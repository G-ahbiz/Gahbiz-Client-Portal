import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
export interface ServicesListTitles {
  id: number;
  serviceEn: string;
  serviceAr: string;
  serviceSp: string;
  active: boolean;
}

export interface AllServicesDetails {
  id: number;
  title: string;
  subTitle: string;
  priceOffer: string;
  orignalPrice: string;
  rating: number;
  ratingsCount: number;
  image: string[];
  type: string;
}
@Injectable({
  providedIn: 'root'
})
export class AllServicesComponentService {

  servicesListTitles: ServicesListTitles[] = [
    { id: 1, serviceEn: 'All Services', serviceAr: 'كل الخدمات', serviceSp: 'Todos los Servicios', active: true },
    { id: 2, serviceEn: 'Tax Services', serviceAr: 'خدمات الضرائب', serviceSp: 'Servicios de Impuestos', active: true },
    { id: 3, serviceEn: 'Public Services', serviceAr: 'خدمات العامة', serviceSp: 'Servicios Públicos', active: true },
    { id: 4, serviceEn: 'Immigration Services', serviceAr: 'خدمات الهجرة', serviceSp: 'Servicios de Inmigración', active: true },
    { id: 5, serviceEn: 'Food Vendor Services', serviceAr: 'خدمات المطاعم', serviceSp: 'Servicios de Vendedores de Alimentos', active: true },
    { id: 6, serviceEn: 'Business License Services', serviceAr: 'خدمات رخصة الأعمال', serviceSp: 'Servicios de Licencia Comercial', active: true },
    { id: 7, serviceEn: 'ITIN & EIN Services', serviceAr: 'خدمات ITIN & EIN', serviceSp: 'Servicios de ITIN & EIN', active: true },
    { id: 8, serviceEn: 'DMV Services', serviceAr: 'خدمات DMV', serviceSp: 'Servicios de DMV', active: true },
    { id: 9, serviceEn: 'Translation & Notary Public Services', serviceAr: 'خدمات الترجمة والعهد العام', serviceSp: 'Servicios de Traducción y Notario Público', active: true },
    { id: 10, serviceEn: 'Appointment Service', serviceAr: 'خدمات المواعيد', serviceSp: 'Servicios de Reservación', active: true },
  ];

  allServices: AllServicesDetails[] = [
    {
      id: 1,
      title: 'File Your Tax 1040 Single or MJS - Stander',
      subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
      priceOffer: '85',
      orignalPrice: '102',
      rating: 3,
      ratingsCount: 36,
      image: ['service.jpg'],
      type: 'basic'
    },
    {
      id: 2,
      title: 'File Your Tax 1040 Single or MJS - Stander',
      subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
      priceOffer: '85',
      orignalPrice: '102',
      rating: 2,
      ratingsCount: 36,
      image: ['service.jpg'],
      type: 'standard'
    },
    {
      id: 3,
      title: 'File Your Tax 1040 Single or MJS - Stander',
      subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
      priceOffer: '85',
      orignalPrice: '102',
      rating: 5,
      ratingsCount: 36,
      image: ['service.jpg'],
      type: 'gold'
    },
    {
      id: 4,
      title: 'File Your Tax 1040 Single or MJS - Stander',
      subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
      priceOffer: '85',
      orignalPrice: '102',
      rating: 4,
      ratingsCount: 36,
      image: ['service.jpg'],
      type: 'silver'
    },
  ]

  seviceDetails: any[] = [
    {
      id: 1,
      title: 'File Your Tax 1040 Single or MJS - Stander',
      subTitle: 'Live Filfing - Single - File your tax as status of Single with 2 w2 form or 2 - Schdule C....',
      priceOffer: '85',
      orignalPrice: '102',
      rating: 3,
      ratingsCount: 36,
      image: { image1: 'service.jpg', image2: 'service.jpg', image3: 'service.jpg', image4: 'service.jpg', image5: 'service.jpg', image6: 'service.jpg' },
    },
  ]

  // BehaviorSubject to hold the active service state
  private activeServiceListSubject = new BehaviorSubject<number>(this.getInitialActiveServiceList());
  private activeServiceSubject = new BehaviorSubject<number>(this.getInitialActiveService());
  private cartSubject = new BehaviorSubject<number[]>(this.getInitialCart());

  // Observable that components can subscribe to
  public activeServiceList$: Observable<number> = this.activeServiceListSubject.asObservable();
  public activeService$: Observable<number> = this.activeServiceSubject.asObservable();
  public cart$: Observable<number[]> = this.cartSubject.asObservable();

  constructor() {
    // Initialize active service from localStorage if available
    const storedService = localStorage.getItem('activeServiceList');
    if (storedService) {
      this.activeServiceListSubject.next(parseInt(storedService));
    }
  }

  // Service List
  // Get the initial active service list from localStorage or default to 1
  private getInitialActiveServiceList(): number {
    const stored = localStorage.getItem('activeServiceList');
    return stored ? parseInt(stored) : 1;
  }

  // Get the current active service list value synchronously
  getActiveServiceList(): number {
    return this.activeServiceListSubject.value;
  }

  // Set the active service list and persist to localStorage
  setActiveServiceList(serviceId: number): void {
    this.activeServiceListSubject.next(serviceId);
    localStorage.setItem('activeServiceList', serviceId.toString());
  }

  // Clear active service list (useful for cleanup)
  clearActiveServiceList(): void {
    localStorage.removeItem('activeServiceList');
    this.activeServiceListSubject.next(1);
  }


  // Service Details
  // Get the initial active service from localStorage or default to 1
  private getInitialActiveService(): number {
    const stored = localStorage.getItem('activeService');
    return stored ? parseInt(stored) : 1;
  }

  // Get the current active service value synchronously
  getActiveService(): number {
    return this.activeServiceSubject.value;
  }

  // Set the active service and persist to localStorage
  setActiveService(serviceId: number): void {
    this.activeServiceSubject.next(serviceId);
    localStorage.setItem('activeService', serviceId.toString());
  }

  // Clear active service (useful for cleanup)
  clearActiveService(): void {
    localStorage.removeItem('activeService');
    this.activeServiceSubject.next(1);
  }

  // Cart
  // Get the initial cart from localStorage or default to empty array
  private getInitialCart(): number[] {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  }

  // Get the current cart value synchronously
  getCart(): number[] {
    return this.cartSubject.value;
  }

  // Add to cart
  addToCart(serviceId: number): void {
    // const cart = this.getCart();
    // cart.push(serviceId);
    // this.cartSubject.next(cart);
    // localStorage.setItem('cart', JSON.stringify(cart));
  }
}
