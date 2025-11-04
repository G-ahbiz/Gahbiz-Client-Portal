export interface Review {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  rating: number;
  authorName: string;
  authorImageUrl: string | null;
  comment: string;
  createdAt: string; // ISO date string
  updatedAt: string | null;
}
