export interface WishlistProductItem {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
}

export interface WishlistApiResponse {
  status: string;
  message: string;
  wishlist: Array<{
    id: number;
    product_id: number;
    product: {
      id: number;
      name: string;
      slug: string;
      main_image: string | null;
      price: number | null;
    };
  }>;
}

export interface ToggleWishlistResponse {
  status: string;
  message: string;
  action: "added" | "removed";
}

export interface RemoveWishlistResponse {
  status: string;
  message: string;
}