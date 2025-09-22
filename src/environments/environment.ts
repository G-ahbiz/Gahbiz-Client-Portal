export const environment = {
  production: false,
  apiUrl: 'https://serva-best.runasp.net',

  account: {
    login: '/Account/login',
    refresh: '/Account/refresh-token',
    forgotPassword: '/Account/forgot-password',
    resetPassword: (useOtp: boolean) => `/Account/reset-password/${useOtp}`,
    resendOtp: '/Account/resend-otp',
    signup: '/Account/register',
  },
};
