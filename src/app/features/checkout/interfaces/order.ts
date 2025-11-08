import { OrderItem } from "./order-item";

export interface Order {
  id: string;
  name: string;
  address: string;
  zipCode: string;
  country: string;
  state: string;
  county: string;
  city: string;
  contactInfo: string;
  createdDate: string;
  amount: number;
  discount: number;
  note: string;
  status: string;
  userId: string;
  delivery: any;
  orderItems: OrderItem[];
  promocodeId: string | null;
  promocode: any;
}