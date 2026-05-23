import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],      
  totalQuantity: 0,
  totalPrice: 0,
  isLoaded: false,
};

const calculateTotals = (items) => {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalQuantity, totalPrice };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Used to sync server cart (DB) or validated cart to Redux
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalQuantity = action.payload.totalQuantity || 0;
      state.totalPrice = action.payload.totalPrice || 0;
      state.isLoaded = true;
    },

    addToCart: (state, action) => {
      const newItem = action.payload;
      const itemId = newItem._id || newItem.id;

      if (!itemId) return;

      const existingItem = state.items.find((item) => item._id === itemId);
      
      // Use provided stock or fallback to a safe default if strictly not provided
      // If stock is 0, we shouldn't have been able to call this, but as a safety guard:
      const maxStock = newItem.stock !== undefined ? newItem.stock : 999;
      const quantityToAdd = newItem.quantity || 1;

      if (!existingItem) {
        // New Item: Add only if valid stock
        if (quantityToAdd <= maxStock && maxStock > 0) {
            state.items.push({
              _id: itemId,
              name: newItem.name,
              price: newItem.price,
              image: newItem.image,
              slug: newItem.slug,
              series: newItem.series,
              year: newItem.year,
              stock: maxStock, // Persist stock limit in cart state
              quantity: quantityToAdd,
            });
        }
      } else {
        // Existing Item: Increment responsibly
        // Update the stored stock limit in case it changed
        existingItem.stock = maxStock; 
        
        const newTotal = existingItem.quantity + quantityToAdd;
        
        if (newTotal <= maxStock) {
            existingItem.quantity = newTotal;
        } else {
            // Cap at max stock if they try to exceed it
            existingItem.quantity = maxStock;
        }
      }
      
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
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
        
        const totals = calculateTotals(state.items);
        state.totalQuantity = totals.totalQuantity;
        state.totalPrice = totals.totalPrice;
        state.isLoaded = true;
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item._id !== id);
      
      const totals = calculateTotals(state.items);
      state.totalQuantity = totals.totalQuantity;
      state.totalPrice = totals.totalPrice;
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