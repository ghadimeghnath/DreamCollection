import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/cart/cartSlice"; // We will create this next
import productReducer from "@/features/product/productSlice";
import authReducer from "../features/auth/authSlice";

// Function to create the store (essential for Next.js SSR to avoid state pollution)
export const makeStore = () => {
  return configureStore({
    reducer: {
      // Add your feature reducers here
      cart: cartReducer,
      product: productReducer,
      auth: authReducer,
      // user: userReducer,
    },
  });
};
