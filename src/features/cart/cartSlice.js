import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],      
  totalQuantity: 0,
  totalPrice: 0,
  isLoaded: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Action to replace entire cart (used for DB fetch and Validation sync)
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalQuantity = action.payload.totalQuantity || 0;
      state.totalPrice = action.payload.totalPrice || 0;
      state.isLoaded = true;
    },

    addToCart: (state, action) => {
      const newItem = action.payload;
      const itemId = newItem._id || newItem.id;

      if (!itemId) {
        console.error("Cart Error: Item has no ID", newItem);
        return; 
      }

      const existingItem = state.items.find((item) => item._id === itemId);

      if (!existingItem) {
        state.items.push({
          _id: itemId,
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          slug: newItem.slug,
          series: newItem.series,
          year: newItem.year,
          quantity: newItem.quantity || 1,
        });
      } else {
        existingItem.quantity += (newItem.quantity || 1);
      }
      
      // Recalculate totals from scratch to avoid drift
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.isLoaded = true;
    },

    decrementItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);

      if (existingItem) {
        if (existingItem.quantity === 1) {
           state.items = state.items.filter(item => item._id !== id);
        } else {
           existingItem.quantity--;
        }
        
        state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
        state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        state.isLoaded = true;
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item._id !== id);
      
      state.totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);
      state.totalPrice = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.isLoaded = true;
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    }
  },
});

export const { addToCart, removeFromCart, clearCart, setCart, decrementItem } = cartSlice.actions;
export default cartSlice.reducer;