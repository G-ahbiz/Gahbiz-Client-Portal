import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { Observable, map } from 'rxjs';
import { Category } from '../interfaces/category';

@Injectable({
  providedIn: 'root',
})
export class LandingApiService {
  private base = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAllCategories(includeServices = false): Observable<Category[]> {
    const pageSize = 50;
    let pageNumber = 1;
    let allItems: Category[] = [];

    return new Observable<Category[]>((observer) => {
      const fetchPage = () => {
        this.http
          .get<ApiResponse<{ items: Category[]; hasNextPage: boolean }>>(
            `${this.base}${environment.serviceCategories.getAllServiceCategories}`,
            { params: { includeServices, pageNumber, pageSize } }
          )
          .subscribe({
            next: (res) => {
              const items = res?.data?.items ?? [];
              allItems = [...allItems, ...items];
              if (res?.data?.hasNextPage) {
                pageNumber++;
                fetchPage();
              } else {
                observer.next(allItems);
                observer.complete();
              }
            },
            error: (err) => observer.error(err),
          });
      };

      fetchPage();
    });
  }

  getBestOffers(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.base}${environment.services.bestOffers}`)
      .pipe(map((res) => res?.data ?? []));
  }
}
