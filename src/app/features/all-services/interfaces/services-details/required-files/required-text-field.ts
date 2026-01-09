export interface RequiredTextField {
  key: string;
  label: string;
  type: string;
  required: boolean;

  options?: string[];
  description?: string;
  placeholder?: string;
  pattern?: string;
  min?: number;
  max?: number;
}
