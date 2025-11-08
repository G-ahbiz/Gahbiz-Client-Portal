export interface CheckoutResponse {
  Success: boolean;
  OrderId?: string;
  Error?: string;
  TransactionId?: string;
}