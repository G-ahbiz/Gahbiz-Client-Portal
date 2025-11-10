export const environment = {
  production: false,

  apiUrl: 'https://serva-best.runasp.net/api',
  //apiUrl: 'https://localhost:7204/api',

  // Google third party auth
  googleClientId: '710517406086-vlr501mfdnbmc5o8p8jv07qaks1jvveg.apps.googleusercontent.com',
  googleUrl: 'https://accounts.google.com/gsi/client',

  // Facebook third party auth
  facebookAppId: '1786936631940004',

  // Authorize.net
  useSandboxAcceptJs: true, // true: use sandbox, false: use production
  apiLoginID: '25pQwt2Vd', // sandbox
  clientKey: '95n56trhr7Cg4cvFMSEjtWL2P9K7m4685G7HQ3mtJGVTW2FSCcbd8TNRCMat5z9x',

  // APIs
  reviews: {
    createReview: '/Reviews',
    getReviewsByService: '/Reviews/service/',
  },
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
  appointmentSettings: {
    getAvailableSlots: (branchId: string) => `/appointment-settings/${branchId}/available-slots`,
    bookAppointment: (branchId: string) => `/appointment-settings/${branchId}/book`,
    getAppointmentSettings: (branchId: string) => `/appointment-settings/${branchId}`,
  },
  branches: {
    getBranches: '/Branches',
  },
  serviceCategories: {
    getAllServiceCategories: '/ServiceCategories',
  },
  orders: {
    getOrderById: (orderId: string) => `/Orders/${orderId}`,
  },
  pay: {
    checkout: '/Pay',
  },
  services: {
    getAllServices: '/Services',
    getServiceByCategory: '/Services/category/',
    getServiceById: '/Services/',
    bestOffers: '/Services/best-offers',
  },
  states: {
    getStatesByCountry: '/states/country/',
  },
  countries: {
    getAllCountries: '/countries/All/Countries',
  },
  serviceSubmissions: {
    getRequiredFiles: `/ServiceSubmissions/`,
    submitService: `/ServiceSubmissions`,
  },
  Wishlist: {
    getWishlist: '/Wishlist',
    addToWishlist: '/Wishlist/add',
    removeFromWishlist: '/Wishlist/remove',
  },
  promoCodes: {
    applyPromoCode: '/PromoCodes/apply',
  },
  confirmTokenTtlMs: 5 * 60 * 100,
};
