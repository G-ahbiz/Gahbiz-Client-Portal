import { ServiceCategory } from './service-category';

export interface PaginatedCategories {
  items: ServiceCategory[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
