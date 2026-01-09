export interface ApplyPromoCodeResponse {
  isValid: boolean;
  discountAmount?: number;
  type?: 'percentage' | 'fixed';
  expiryDate?: string;
  price?: number;
}
