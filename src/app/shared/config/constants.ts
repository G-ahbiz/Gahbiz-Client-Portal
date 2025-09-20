import { CountryCodes } from '../interfaces/country-codes';

export const ROUTES = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
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

