import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/interfaces/api-response';
import { environment } from '@env/environment';
import { map, Observable } from 'rxjs';

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

  getCountries(): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.base}${environment.countries.getAllCountries}`)
      .pipe(map((response) => response.data));
  }

  getStatesByCountry(countryId: number): Observable<any[]> {
    return this.http
      .get<ApiResponse<any[]>>(`${this.base}${environment.states.getStatesByCountry}${countryId}`)
      .pipe(map((response) => response.data));
  }
}
