import type { WishlistApiResponse, ToggleWishlistResponse, RemoveWishlistResponse } from "@/types/wishlist";

async function wishlistApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `API Error: ${response.status}`);
  }

  return data as T;
}

export async function getWishlist(): Promise<WishlistApiResponse> {
  return wishlistApi<WishlistApiResponse>("/api/wishlists");
}

export async function toggleWishlist(productId: number): Promise<ToggleWishlistResponse> {
  return wishlistApi<ToggleWishlistResponse>("/api/wishlists/toggle", {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });
}

export async function removeWishlistItem(productId: number): Promise<RemoveWishlistResponse> {
  return wishlistApi<RemoveWishlistResponse>(`/api/wishlists/${productId}`, {
    method: "DELETE",
  });
}
