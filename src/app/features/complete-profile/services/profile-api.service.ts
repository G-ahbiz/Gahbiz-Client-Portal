import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, take, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileApiService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  completeProfile(profileData: FormData) {
    return this.http.put<any>(`${this.base}${environment.account.CompleteProfile}`, profileData);
  }

  getProfile() {
    return this.http.get<any>(`${this.base}${environment.account.getProfile}`);
  }

  // Get countries with pagination
  getCountries(page = 1, pageSize = 100): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<ApiResponse<any>>(`${this.base}${environment.countries.getAllCountries}`, { params })
      .pipe(map((response) => response.data));
  }

  // Get ALL countries by fetching all pages - FIXED VERSION
  getAllCountries(): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      const allCountries: any[] = [];

      const fetchPage = (page: number) => {
        this.getCountries(page, 100).subscribe({
          next: (response) => {
            if (response && response.items) {
              allCountries.push(...response.items);

              // Check if we should fetch next page
              if (response.hasNextPage && page < response.totalPages) {
                fetchPage(page + 1);
              } else {
                // We've fetched all pages, complete the observable
                observer.next(allCountries);
                observer.complete();
              }
            } else {
              // No more items or invalid response
              observer.next(allCountries);
              observer.complete();
            }
          },
          error: (err) => {
            console.error('Error fetching countries page:', err);
            // Return what we have so far
            observer.next(allCountries);
            observer.complete();
          },
        });
      };

      // Start fetching from page 1
      fetchPage(1);
    }).pipe(
      take(1) // Ensure it completes after emitting once
    );
  }

  getStatesByCountry(countryId: number, page = 1, pageSize = 100): Observable<any> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<ApiResponse<any>>(`${this.base}${environment.states.getStatesByCountry}${countryId}`, {
        params,
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('Error fetching states page:', error);
          return of({ items: [], hasNextPage: false });
        })
      );
  }

  getAllStatesByCountry(countryId: number): Observable<any[]> {
    return new Observable<any[]>((observer) => {
      const allStates: any[] = [];

      const fetchPage = (page: number) => {
        this.getStatesByCountry(countryId, page, 100).subscribe({
          next: (response) => {
            if (response && response.items) {
              allStates.push(...response.items);

              // Check if we should fetch next page
              if (response.hasNextPage && page < (response.totalPages || 10)) {
                fetchPage(page + 1);
              } else {
                observer.next(allStates);
                observer.complete();
              }
            } else {
              observer.next(allStates);
              observer.complete();
            }
          },
          error: (err) => {
            console.error('Error fetching states page:', err);
            observer.next(allStates);
            observer.complete();
          },
        });
      };

      fetchPage(1);
    }).pipe(
      take(1) 
    );
  }
}
