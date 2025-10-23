export interface Category {
  id: string;
  active: boolean;
  home: boolean;
  name: string;
  images?: string[] | null;
  description?: string | null;
  parentId?: string | null;
  serviceCount?: number;
}