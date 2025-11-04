import { PaginatedServices } from './paginated-services';

export interface ServiceCategory {
  id: string;
  active: boolean;
  home: boolean;
  name: string;
  images: string[];
  description: string;
  serviceCount: number;
  parentId: string | null;
  services?: PaginatedServices;

  isLoading?: boolean;
}
