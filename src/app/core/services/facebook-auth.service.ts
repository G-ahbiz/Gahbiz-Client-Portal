/// <reference types="facebook-js-sdk" />

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const FB: fb.FacebookStatic;

@Injectable({ providedIn: 'root' })
export class FacebookAuthService {
  private sdkReady!: Promise<void>;

  constructor() {
    this.sdkReady = this.loadSdk();
  }

  /** Load and init Facebook SDK */
  private loadSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptId = 'facebook-jssdk';

      const initFacebook = () => {
        if (!(window as any).FB) {
          reject(new Error('FB SDK not available'));
          return;
        }
        FB.init({
          appId: environment.facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v21.0',
        });
        console.log('✅ FB.init done');
        resolve();
      };

      // If FB already exists, but not initialized → force init
      if ((window as any).FB) {
        console.log('✅ FB already loaded (manual init)');
        initFacebook();
        return;
      }

      // Normal async load
      (window as any).fbAsyncInit = initFacebook;

      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('❌ Failed to load Facebook SDK'));
        document.body.appendChild(script);
      }
    });
  }

  /** Run login flow */
  async login(): Promise<string> {
    await this.sdkReady; // ensures fbAsyncInit + FB.init are finished

    return new Promise((resolve, reject) => {
      if (!(window as any).FB) {
        reject(new Error('Facebook SDK not loaded. Please refresh the page and try again.'));
        return;
      }

      FB.login(
        (response: fb.StatusResponse) => {
          console.log('Facebook login response:', response);

          if (response.status === 'connected' && response.authResponse?.accessToken) {
            console.log('✅ Facebook login successful');
            resolve(response.authResponse.accessToken);
          } else if (response.status === 'not_authorized') {
            reject(new Error('Facebook login was not authorized. Please try again.'));
          } else if (response.status === 'unknown') {
            reject(new Error('Facebook login failed. Please try again.'));
          } else {
            reject(new Error('Facebook login was cancelled or failed.'));
          }
        },
        { scope: 'email,public_profile' }
      );
    });
  }

  logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!(window as any).FB) {
        console.warn('Facebook SDK not loaded for logout');
        resolve(); // Don't reject, just resolve silently
        return;
      }

      FB.logout((response) => {
        console.log('📤 FB.logout called:', response);
        resolve();
      });
    });
  }
}
