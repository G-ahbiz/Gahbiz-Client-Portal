import { ApiImage } from '@core/interfaces/api-image';

export interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  priceBefore: number;
  rate: number;
  rateCount: number;
  image: string;
}
