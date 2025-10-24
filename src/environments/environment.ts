import { CompleteProfile } from "@features/complete-profile/complete-profile";
import { count } from "rxjs";

export const environment = {
  production: false,

  //apiUrl: 'https://serva-best.runasp.net/api',
  apiUrl: 'https://localhost:7204/api',

  googleClientId: '710517406086-vlr501mfdnbmc5o8p8jv07qaks1jvveg.apps.googleusercontent.com',
  googleUrl: 'https://accounts.google.com/gsi/client',

  account: {
    login: '/Account/login',
    refresh: '/Account/refresh-token',
    forgotPassword: '/Account/forgot-password',
    resetPassword: '/Account/reset-password',
    resendOtp: '/Account/resend-otp',
    signup: '/Account/register',
    confirmEmail: '/Account/ConfirmEmail', // link to confirm email
    resendEmailConfirmation: '/Account/resend-email-confirmation',
    verifyOtp: '/Account/verify-otp', // OTP to verify email
    getProfile: '/Account/profile',
    CompleteProfile: '/Account/Profile',
    externalLogin: '/Account/external-login',
  },
  serviceCategories: {
    getAllServiceCategories: '/ServiceCategories',
  },
  services: {
    bestOffers: '/Services/best-offers',
  },
  states: {
    getStatesByCountry: '/states/country/',
  },
  countries: {
    getAllCountries: '/countries/All/Countries',
  },

  facebookAppId: '1786936631940004',

  confirmTokenTtlMs: 5 * 60 * 100,
};
