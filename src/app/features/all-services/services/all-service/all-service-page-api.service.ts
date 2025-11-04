import { HttpClient, HttpParams, HttpContext, HttpContextToken } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

// Define cache context tokens
export const CACHEABLE_TOKEN = new HttpContextToken<boolean>(() => false);
export const CACHE_TTL_TOKEN = new HttpContextToken<number>(() => 300000);

// Create HttpContext instances with tokens set
export const CACHEABLE = new HttpContext().set(CACHEABLE_TOKEN, true);
export const CACHE_TTL = new HttpContext().set(CACHE_TTL_TOKEN, 300000); // 5 minutes

@Injectable({
  providedIn: 'root',
})
export class AllServicePageApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  getCategories(
    page: number,
    size: number,
    includeServices: boolean,
    servicesPageSize: number
  ): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString())
      .set('includeServices', includeServices.toString())
      .set('servicesPageSize', servicesPageSize.toString());

    return this.http.get<any>(
      `${this.baseUrl}${environment.serviceCategories.getAllServiceCategories}`,
      {
        params,
        context: CACHEABLE,
      }
    );
  }

  getServicesByCategory(id: string, page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString());

    return this.http.get<any>(`${this.baseUrl}${environment.services.getServiceByCategory}${id}`, {
      params,
    });
  }
}
