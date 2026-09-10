import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/lib/features/cart/cartSlice";
import wishlistReducer from "@/lib/features/wishlist/wishlistSlice";
import authReducer from "@/lib/features/auth/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
      auth: authReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
