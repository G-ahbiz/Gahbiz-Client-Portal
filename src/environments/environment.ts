export const environment = {
  production: false,

  apiUrl: 'https://serva-best.runasp.net/api',
  // apiUrl: 'https://localhost:7204/api',

  account: {
    login: '/Account/login',
    refresh: '/Account/refresh-token',
    forgotPassword: '/Account/forgot-password',
    resetPassword: '/Account/reset-password',
    resendOtp: '/Account/resend-otp',
    signup: '/Account/register',
    confirmEmail: '/Account/ConfirmEmail', // link to confirm email
    resendEmailConfirmation: '/Account/resend-email-confirmation',
    verifyOtp: '/Account/verify-otp',  // OTP to verify email
    externalLogin: '/Account/external-login',
  },

  facebookAppId: '24635154546118319',

  confirmTokenTtlMs: 5 * 60 * 100,
};
