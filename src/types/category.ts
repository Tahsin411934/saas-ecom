/**
 * Category represents a product category from the backend.
 * Used across category listing, single category, and product pages.
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: string;
  parent_id: number | null;
  sort_order?: number;
  products_count?: number;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface SingleCategoryResponse {
  success: boolean;
  message: string;
  data: Category | null;
}