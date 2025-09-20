export const ROUTES = {
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
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
