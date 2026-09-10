import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { normalizeAssetUrl } from "@/lib/asset-url";
import * as wishlistService from "@/services/wishlist.service";

export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  variant_id?: number;
  variant_name?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null,
};

function loadInitialState(): WishlistState {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = localStorage.getItem("OneHaatbd_wishlist");
    if (!stored) return initialState;

    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return { items: normalizeStoredItems(parsed), isLoading: false, error: null };
    }
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
      return {
        items: normalizeStoredItems(parsed.items),
        isLoading: parsed.isLoading ?? false,
        error: parsed.error ?? null,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return initialState;
}

// Rewrite legacy backend hosts (pos.aftsoftandlimited.com) persisted in older
// wishlist entries so images keep resolving after the domain migration.
function normalizeStoredItems(items: WishlistItem[]): WishlistItem[] {
  return items.map((item) => ({
    ...item,
    image: normalizeAssetUrl(item.image) || null,
  }));
}

function saveWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("OneHaatbd_wishlist", JSON.stringify({ items, isLoading: false, error: null }));
  } catch {
    // Ignore write failures
  }
}

export const fetchWishlistItems = createAsyncThunk(
  "wishlist/fetchWishlistItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistService.getWishlist();
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to load wishlist.");
      }
      return response.wishlist.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        image: item.product.main_image,
        price: item.product.price ?? 0,
      } as WishlistItem));
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load wishlist.");
    }
  }
);

export const toggleWishlistItem = createAsyncThunk(
  "wishlist/toggleWishlistItem",
  async (
    payload: {
      productId: number;
      item: WishlistItem;
      isWishlisted: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      if (payload.isWishlisted) {
        const response = await wishlistService.removeWishlistItem(payload.productId);
        if (response.status !== "success") {
          throw new Error(response.message || "Failed to remove wishlist item.");
        }
        return { action: "removed" as const, item: payload.item };
      }

      const response = await wishlistService.toggleWishlist(payload.productId);
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to add wishlist item.");
      }

      return {
        action: "added" as const,
        item: payload.item,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update wishlist.");
    }
  }
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/removeWishlistItem",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await wishlistService.removeWishlistItem(productId);
      if (response.status !== "success") {
        throw new Error(response.message || "Failed to remove wishlist item.");
      }
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove wishlist item.");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: loadInitialState(),
  reducers: {
    clearWishlist(state) {
      state.items = [];
      state.error = null;
      saveWishlist(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
        state.error = null;
        saveWishlist(state.items);
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleWishlistItem.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        if (action.payload.action === "added") {
          const exists = state.items.find((item) => item.id === action.payload.item.id);
          if (!exists) {
            state.items.push(action.payload.item);
          }
        } else {
          state.items = state.items.filter((item) => item.id !== action.payload.item.id);
        }
        saveWishlist(state.items);
      })
      .addCase(toggleWishlistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(removeWishlistItem.pending, (state) => {
        state.error = null;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        saveWishlist(state.items);
      })
      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;

export const selectWishlistItems = (state: { wishlist: WishlistState }) => state.wishlist.items;
export const selectWishlistCount = (state: { wishlist: WishlistState }) => state.wishlist.items.length;
export const selectIsInWishlist = (id: number, variant_id?: number) => (state: { wishlist: WishlistState }) =>
  state.wishlist.items.some((item) => {
    if (typeof variant_id === "undefined") {
      return item.id === id;
    }
    return item.id === id && item.variant_id === variant_id;
  });

export default wishlistSlice.reducer;
