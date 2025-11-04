import { ApiImage } from '@core/interfaces/api-image';

export interface ServicesDetailsResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  rate: number;
  rateCount: number;
  categoryName: string;
  
  coreCategoryName?: string | null;
  
  images: ApiImage[];

  branchIds: string[];
  categoryId: string;

  priceBefore?: number;
  deliveryTime?: number;
  deliveryTimeRate?: string;
}
