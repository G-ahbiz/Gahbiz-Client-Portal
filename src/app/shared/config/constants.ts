import { CountryCodes } from '../interfaces/country-codes';

export const ROUTES = {
  home: '/',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  confirmEmail: '/auth/confirm-email',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
};

export const COUNTRIES: CountryCodes[] = [
  { name: 'United States', dialCode: '+1', iso2: 'us', image: 'assets/images/navbar/language-icons/america.svg' },
  { name: 'Egypt', dialCode: '+20', iso2: 'eg', image: 'assets/images/navbar/language-icons/egypt.svg' },
  { name: 'Spain', dialCode: '+34', iso2: 'sp', image: 'assets/images/navbar/language-icons/spain.svg' },
  { name: 'United Kingdom', dialCode: '+44', iso2: 'gb', image: 'assets/images/navbar/language-icons/united-kingdom.svg' },
  { name: 'Saudi Arabia', dialCode: '+966', iso2: 'sa', image: 'assets/images/navbar/language-icons/saudi-arabia.svg' },
  { name: 'UAE', dialCode: '+971', iso2: 'ae', image: 'assets/images/navbar/language-icons/united-arab-emirates.svg' },
  { name: 'Canada', dialCode: '+1', iso2: 'ca', image: 'assets/images/navbar/language-icons/canada.svg' },
  { name: 'India', dialCode: '+91', iso2: 'in', image: 'assets/images/navbar/language-icons/india.svg' },
  { name: 'Germany', dialCode: '+49', iso2: 'de', image: 'assets/images/navbar/language-icons/germany.svg' },
  { name: 'France', dialCode: '+33', iso2: 'fr', image: 'assets/images/navbar/language-icons/france.svg' },
  { name: 'Brazil', dialCode: '+55', iso2: 'br', image: 'assets/images/navbar/language-icons/brazil.svg' },
  { name: 'Japan', dialCode: '+81', iso2: 'jp', image: 'assets/images/navbar/language-icons/japan.svg' },
  { name: 'China', dialCode: '+86', iso2: 'cn', image: 'assets/images/navbar/language-icons/china.svg' },
  { name: 'South Africa', dialCode: '+27', iso2: 'za', image: 'assets/images/navbar/language-icons/south-africa.svg' },
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
};

export const REG_EXP = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
  OTP: /^\d{6}$/,
};
