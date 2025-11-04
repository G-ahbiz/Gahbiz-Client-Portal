export interface CreateReviewRequest {
  serviceId: string;
  rating: number;
  comment: string;
  name: string;
  email: string;
}

export function isValidCreateReviewRequest(obj: any): obj is CreateReviewRequest {
  return (
    obj &&
    typeof obj.serviceId === 'string' &&
    obj.serviceId.trim().length > 0 &&
    typeof obj.rating === 'number' &&
    obj.rating >= 1 &&
    obj.rating <= 5 &&
    typeof obj.comment === 'string' &&
    obj.comment.trim().length >= 10 &&
    typeof obj.name === 'string' &&
    obj.name.trim().length >= 2 &&
    typeof obj.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email.trim())
  );
}
