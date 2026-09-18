/**
 * Product types shared across the frontend.
 * Consolidates: CategoryProduct, HomeProduct, RelatedProduct, ProductSearchResult
 */

// ===== Core Product (used in listings) =====

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  main_image: string | null;
  /** Price after discount (what the customer pays). */
  price: number | null;
  /** Regular (pre-discount) price - used for strikethrough display. */
  regular_price?: number | null;
  /** Effective discount percentage. */
  discount_percent?: number;
  /** Absolute discount amount = regular_price - price. */
  discount_amount?: number;
  /** Whether the product currently has a discount. */
  has_discount?: boolean;
  /** Product-level delivery charge (৳) — the highest one in the cart becomes the shipping charge. */
  delivery_charge?: number;
  product_type: string;
  stock_status?: string;
  rating?: number;
  review_count?: number;
}

// ===== Category Products Page =====

export type CategorySortOption = "latest" | "price_asc" | "price_desc" | "name";

export const SORT_OPTIONS: { label: string; value: CategorySortOption }[] = [
  { label: "Latest", value: "latest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A-Z", value: "name" },
];

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CategoryProductsRawResponse {
  status?: string;
  message?: string;
  data: {
    category: import("./category").Category;
    products: ProductListItem[];
    meta?: PaginationInfo;
  };
}

export interface CategoryProductsData {
  category: import("./category").Category;
  products: ProductListItem[];
  meta?: PaginationInfo;
}

// ===== Product Detail =====

export interface ProductDetailData {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  product_type: string;
  status: string;
  visibility: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  /** Product-level delivery charge (৳) — the highest one in the cart becomes the shipping charge. */
  delivery_charge?: number;
  /** Owning store (null = platform product) — drives multi-store split-shipment warnings. */
  store_id?: number | null;
  store?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  price_range: {
    min: number;
    max: number;
  } | null;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  main_image: string | null;
  gallery: ProductImage[];
  variants: ProductVariant[];
  attribute_options?: {
    colors: { value: string; hex?: string | null; available_count: number; available: boolean }[];
    sizes: { value: string; available_count: number; available: boolean }[];
  } | null;
  reviews: ProductReviews;
  related_products: ProductListItem[];
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  data: ProductDetailData;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  is_main: boolean;
  sort_order: number;
}

export interface VariantOption {
  id: number;
  color_name: string;
  color_code: string | null;
  sku: string | null;
  barcode: string | null;
  image_url: string | null;
  cost_price: number | null;
  sale_price: number | null;
  regular_price?: number | null;
  discount_price?: number | null;
  compare_at_price: number | null;
  discount_percent: number;
  has_discount?: boolean;
  price_adjustment?: number;
  stock: number | null;
}

export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  sale_price: number;
  regular_price?: number | null;
  discount_price?: number | null;
  discount_percent?: number;
  has_discount?: boolean;
  compare_at_price: number | null;
  cost_price: number | null;
  stock: number | null;
  track_inventory: boolean;
  allow_backorder: boolean;
  attributes: Record<string, string> | null;
  image: string | null;
  options: VariantOption[];
}

export interface ProductReviews {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
  items: ReviewItem[];
}

export interface ReviewItem {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  user_name: string | null;
  is_verified_purchase: boolean;
  created_at: string;
}

// ===== Product Search =====

export interface ProductSearchResult {
  id: number;
  name: string;
  slug: string;
  /** Price after discount. */
  price: number | null;
  sale_price?: number;
  regular_price?: number | null;
  discount_percent?: number;
  has_discount?: boolean;
  thumbnail?: string;
  category?: string;
  stock_status?: string;
}

export interface ProductSearchResponse {
  success: boolean;
  message: string;
  data: ProductSearchResult[];
}