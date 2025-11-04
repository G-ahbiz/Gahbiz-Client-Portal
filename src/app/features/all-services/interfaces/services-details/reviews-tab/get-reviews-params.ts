export type SortColumn = 'Newest' | 'Oldest' | 'HighestRating' | 'LowestRating';
export type SortDirection = 'ASC' | 'DESC';

export interface GetReviewsParams {
  pageNumber?: number;
  pageSize?: number;
  sortColumn?: SortColumn;
  sortDirection?: SortDirection;
}

// Default values and validation
export const DEFAULT_REVIEWS_PARAMS: Required<GetReviewsParams> = {
  pageNumber: 1,
  pageSize: 10,
  sortColumn: 'Newest',
  sortDirection: 'DESC',
};

export function sanitizeReviewsParams(params: GetReviewsParams): Required<GetReviewsParams> {
  return {
    pageNumber: Math.max(1, params.pageNumber ?? DEFAULT_REVIEWS_PARAMS.pageNumber),
    pageSize: Math.max(1, Math.min(100, params.pageSize ?? DEFAULT_REVIEWS_PARAMS.pageSize)),
    sortColumn: params.sortColumn ?? DEFAULT_REVIEWS_PARAMS.sortColumn,
    sortDirection: params.sortDirection ?? DEFAULT_REVIEWS_PARAMS.sortDirection,
  };
}
