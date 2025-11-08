export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  itemType: string;
  amount: number;
  discount: number;
  quantity: number;
  total: number;
  order: any;
  deliveryType: string;
  shipping: boolean;
}