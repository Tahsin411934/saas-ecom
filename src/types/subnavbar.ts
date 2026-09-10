import type { ProductListItem, PaginationInfo } from "./product";

export interface SubnavbarInfo {
  id: number;
  navbar_item_id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

// Subnavbar product is same as ProductListItem but without rating/review_count
export type SubnavbarProduct = ProductListItem;

export interface SubnavbarProductsData {
  subnavbar: SubnavbarInfo;
  products: SubnavbarProduct[];
  meta?: PaginationInfo;
}

export interface SubnavbarProductsResponse {
  success: boolean;
  message: string;
  data: SubnavbarProductsData;
}

export type SubnavbarSortOption = "latest" | "price_asc" | "price_desc" | "name";