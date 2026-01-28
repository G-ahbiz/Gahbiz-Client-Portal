import { CountryCodes } from '../interfaces/country-codes';

export const ROUTES = {
  home: '/',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  confirmEmail: '/auth/confirm-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  checkout: '/checkout',
  completeProfile: '/complete-profile',
  appointmentService: '/appointment-service',
  wishlist: '/wishlist',
  allServices: '/all-services',
  termsAndConditions: '/info/terms-and-conditions',
  privacyPolicy: '/info/privacy-policy',
  about: '/info/about-us',
  faq: '/info/faq',
  contact: '/info/contact-us',
};

export const COUNTRIES: CountryCodes[] = [
  { name: 'United States', dialCode: '+1', iso2: 'us' },
  { name: 'Egypt', dialCode: '+20', iso2: 'eg' },
  { name: 'Spain', dialCode: '+34', iso2: 'es' },
  { name: 'United Kingdom', dialCode: '+44', iso2: 'gb' },
  { name: 'Saudi Arabia', dialCode: '+966', iso2: 'sa' },
  { name: 'UAE', dialCode: '+971', iso2: 'ae' },
  { name: 'Canada', dialCode: '+1', iso2: 'ca' },
  { name: 'India', dialCode: '+91', iso2: 'in' },
  { name: 'Germany', dialCode: '+49', iso2: 'de' },
  { name: 'France', dialCode: '+33', iso2: 'fr' },
  { name: 'Brazil', dialCode: '+55', iso2: 'br' },
  { name: 'Japan', dialCode: '+81', iso2: 'jp' },
  { name: 'China', dialCode: '+86', iso2: 'cn' },
  { name: 'South Africa', dialCode: '+27', iso2: 'za' },
];

export const SIGNUP_CONSTANTS = {
  NAME_MIN: 3,
  NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 64,
};

export const OTP_CONSTANTS = {
  MIN: 6,
  MAX: 6,
  COOLDOWN: 60,
};

export const OTP_OPERATIONS = {
  CONFIRM_EMAIL: 'confirm-email',
  FORGOT_PASSWORD: 'forgot-password',
  CHANGE_EMAIL: 'change-email',
};

export const SIGNUP_STORAGE_KEYS = {
  KEY_USER_ID: 'signup:userId',
  KEY_EMAIL: 'signup:email',
  KEY_TOKEN: 'signup:token',
  KEY_TOKEN_EXPIRES: 'signup:token_expires',
};

export const LOCAL_STORAGE_KEYS = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_DATA_KEY: 'user_data',
  APPOINTMENT_METADATA_KEY: 'appointment-metadata',
};

export const REG_EXP = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  OTP: /^\d{6}$/,
};

export const CART_ITEMS = {
  APPOINTMENT_SERVICE: '9defe476-1fdb-4050-a15b-a1e04985d854',
};
