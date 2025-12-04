import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],      // Array of Hot Wheels cars
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action: Add Item
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item._id === newItem._id);

      if (!existingItem) {
        // Redux Toolkit allows us to write "mutating" logic in reducers.
        // It doesn't actually mutate the state because it uses the Immer library internally.
        state.items.push({
          _id: newItem._id,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          quantity: 1,
        });
      } else {
        existingItem.quantity++;
      }
      
      state.totalQuantity++;
      state.totalPrice += newItem.price;
    },

    // Action: Remove Item completely
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);

      if (existingItem) {
        state.items = state.items.filter(item => item._id !== id);
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice -= (existingItem.price * existingItem.quantity);
      }
    },
    
    // Action: Clear Cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    }
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
