export interface Offer {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  priceBefore: number;
  discountPercentage?: number;
  rating: number;
}
