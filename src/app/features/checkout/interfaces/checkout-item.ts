export interface CheckoutItem {
  ItemId?: string | null;
  ServiceId?: string | null;
  Name?: string | null;
  Price: number;
  Quantity: number;
  DeliveryType?: number | null;
  Shipping: boolean;
}
