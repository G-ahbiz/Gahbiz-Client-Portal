import { CountryCodes } from '../interfaces/country-codes';

export const ROUTES = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  confirmEmail: '/auth/confirm-email',
};

export const COUNTRIES: CountryCodes[] = [
  { name: 'Egypt', dialCode: '+20', iso2: 'eg' },
  { name: 'United States', dialCode: '+1', iso2: 'us' },
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
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};
