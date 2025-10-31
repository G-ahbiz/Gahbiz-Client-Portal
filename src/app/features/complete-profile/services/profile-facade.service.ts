import { Injectable } from '@angular/core';
import { ProfileApiService } from './profile-api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileFacadeService {
  constructor(private profileApiService: ProfileApiService) {}

  getCountries(): Observable<any[]> {
    return this.profileApiService.getCountries();
  }

  getStatesByCountry(countryId: number): Observable<any[]> {
    return this.profileApiService.getStatesByCountry(countryId);
  }

  completeProfile(profileData: any) {
    return this.profileApiService.completeProfile(profileData);
  }

  getProfile() {
    return this.profileApiService.getProfile();
  }
}
