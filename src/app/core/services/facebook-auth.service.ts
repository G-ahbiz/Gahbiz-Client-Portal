/// <reference types="facebook-js-sdk" />

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const FB: fb.FacebookStatic;

@Injectable({ providedIn: 'root' })
export class FacebookAuthService {
  private sdkReady!: Promise<void>;
  private scriptId = 'facebook-jssdk';

  constructor() {}

  ensureSdkReady(): Promise<void> {
    if (!this.sdkReady) {
      this.sdkReady = this.loadSdk();
    }
    return this.sdkReady;
  }

  /** Load and init Facebook SDK */
  private loadSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      const initFacebook = () => {
        if (!(window as any).FB) {
          reject(new Error('FB SDK not available'));
          return;
        }
        (window as any).FB.init({
          appId: environment.facebookAppId,
          cookie: true,
          xfbml: false,
          version: 'v21.0',
        });
        resolve();
      };

      // If FB already exists => init immediately
      if ((window as any).FB) {
        initFacebook();
        return;
      }

      (window as any).fbAsyncInit = initFacebook;

      if (!document.getElementById(this.scriptId)) {
        const script = document.createElement('script');
        script.id = this.scriptId;
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          /* FB will call fbAsyncInit */
        };
        script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
        document.body.appendChild(script);
      }
    });
  }

  /** Run login flow */
  async login(): Promise<string> {
    await this.ensureSdkReady();
    return new Promise((resolve, reject) => {
      if (!(window as any).FB) {
        reject(new Error('Facebook SDK not loaded.'));
        return;
      }
      (window as any).FB.login(
        (response: fb.StatusResponse) => {
          if (response.status === 'connected' && response.authResponse?.accessToken) {
            resolve(response.authResponse.accessToken);
          } else {
            reject(new Error('Facebook login failed or cancelled'));
          }
        },
        { scope: 'email,public_profile' },
      );
    });
  }

  async logout(): Promise<void> {
    if (!(window as any).FB) return;
    return new Promise((resolve) => (window as any).FB.logout(() => resolve()));
  }
}
