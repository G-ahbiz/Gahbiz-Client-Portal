import { ApiImage } from "@core/interfaces/api-image";

export interface RelatedService {
  id: string;
  name: string;
  price: number;
  priceBefore: number;
  rate: number;
  image: ApiImage | null;
}
