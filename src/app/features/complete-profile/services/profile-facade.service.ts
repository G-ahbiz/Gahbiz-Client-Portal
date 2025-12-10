import { Injectable } from '@angular/core';
import { ProfileApiService } from './profile-api.service';
import { Observable } from 'rxjs';
import { Profile } from '../interfaces/profile';
import { ApiResponse } from '@core/interfaces/api-response';

@Injectable({
  providedIn: 'root',
})
export class ProfileFacadeService {
  constructor(private profileApiService: ProfileApiService) {}

  getCountries(page = 1, pageSize = 100): Observable<any> {
    return this.profileApiService.getCountries(page, pageSize);
  }

  getAllCountries(): Observable<any[]> {
    return this.profileApiService.getAllCountries();
  }

  getStatesByCountry(countryId: number, page = 1, pageSize = 100): Observable<any> {
    return this.profileApiService.getStatesByCountry(countryId, page, pageSize);
  }

  getAllStatesByCountry(countryId: number): Observable<any[]> {
    return this.profileApiService.getAllStatesByCountry(countryId);
  }

  completeProfile(profileData: any): Observable<ApiResponse<Profile>> {
    return this.profileApiService.completeProfile(profileData);
  }

  getProfile() {
    return this.profileApiService.getProfile();
  }
}
