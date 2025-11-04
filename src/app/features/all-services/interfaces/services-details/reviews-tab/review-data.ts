import { createEmptyPaginatedReviews, PaginatedReviews } from './paginated-reviews';

export interface ReviewData {
  rating: number;
  ratingCount: number;
  ratingDistribution: number[];
  reviews: PaginatedReviews;
}

export function createEmptyReviewData(): ReviewData {
  return {
    rating: 0,
    ratingCount: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
    reviews: createEmptyPaginatedReviews(),
  };
}
