import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllServicesComponentService {
  // BehaviorSubject to hold the active service state
  private activeServiceSubject = new BehaviorSubject<number>(this.getInitialActiveService());

  // Observable that components can subscribe to
  public activeService$: Observable<number> = this.activeServiceSubject.asObservable();

  constructor() {
    // Initialize active service from localStorage if available
    const storedService = localStorage.getItem('activeService');
    if (storedService) {
      this.activeServiceSubject.next(parseInt(storedService));
    }
  }

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
}
