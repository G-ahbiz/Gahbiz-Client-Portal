import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AllServicesComponentService {
  // BehaviorSubject to hold the active service state
  private activeServiceSubject = new BehaviorSubject<number>(this.getInitialActiveServiceList());

  // Observable that components can subscribe to
  public activeServiceList$: Observable<number> = this.activeServiceSubject.asObservable();
  // public activeService$: Observable<number> = this.activeServiceSubject.asObservable();

  constructor() {
    // Initialize active service from localStorage if available
    const storedService = localStorage.getItem('activeServiceList');
    if (storedService) {
      this.activeServiceSubject.next(parseInt(storedService));
    }
  }

  // Get the initial active service from localStorage or default to 1
  private getInitialActiveServiceList(): number {
    const stored = localStorage.getItem('activeServiceList');
    return stored ? parseInt(stored) : 1;
  }

  // Get the current active service value synchronously
  getActiveServiceList(): number {
    return this.activeServiceSubject.value;
  }

  // Set the active service and persist to localStorage
  setActiveServiceList(serviceId: number): void {
    this.activeServiceSubject.next(serviceId);
    localStorage.setItem('activeServiceList', serviceId.toString());
  }

  // Clear active service (useful for cleanup)
  clearActiveServiceList(): void {
    localStorage.removeItem('activeServiceList');
    this.activeServiceSubject.next(1);
  }
}
