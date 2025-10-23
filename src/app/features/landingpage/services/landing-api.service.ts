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

  getAllCategories(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(
        `${this.base}${environment.serviceCategories.getAllServiceCategories}`
      )
      .pipe(map((res) => res?.data ?? []));
  }

  getBestOffers(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.base}${environment.services.bestOffers}`)
      .pipe(map((res) => res?.data ?? []));
  }
}
