export interface OrderItem {
  id: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string;
  itemType: string;
  amount: number;
  discount: number;
  quantity: number;
  total: number;
  order: any;
  deliveryType: string;
  shipping: boolean;
  branchId: string;
  branchName: string;
}