import { CheckoutItem } from "./checkout-item";

export interface CheckoutRequest {
  FirstName: string;
  LastName: string;
  Address: string;
  Country: string;
  State: string;
  County?: string | null;
  City: string;
  Zip: string;
  ContactInfo: string;
  CardToken: string;
  PromoCode?: string | null;
  Items: CheckoutItem[];
}
