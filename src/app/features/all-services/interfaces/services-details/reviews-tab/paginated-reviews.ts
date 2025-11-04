import { Review } from './reviews';

export interface PaginatedReviews {
  items: Review[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Helper to create empty paginated reviews
export function createEmptyPaginatedReviews(): PaginatedReviews {
  return {
    items: [],
    pageNumber: 1,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
