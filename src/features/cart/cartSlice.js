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
    setCart: (state, action) => {
      state.items = action.payload.items || [];
      state.totalQuantity = action.payload.totalQuantity || 0;
      state.totalPrice = action.payload.totalPrice || 0;
      state.isLoaded = true;
    },

    addToCart: (state, action) => {
      const newItem = action.payload;
      // FIX: Check for both _id (DB standard) and id (Component standard)
      const itemId = newItem._id || newItem.id;

      if (!itemId) {
        console.error("Cart Error: Item has no ID", newItem);
        return; 
      }

      const existingItem = state.items.find((item) => item._id === itemId);

      if (!existingItem) {
        state.items.push({
          _id: itemId, // Standardize on _id internally
          name: newItem.name,
          price: newItem.price,
          image: newItem.image,
          quantity: newItem.quantity || 1,
        });
      } else {
        existingItem.quantity += (newItem.quantity || 1);
      }
      
      // Update totals
      const qtyToAdd = newItem.quantity || 1;
      state.totalQuantity += qtyToAdd;
      state.totalPrice += newItem.price * qtyToAdd;
      state.isLoaded = true;
    },

    decrementItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);

      if (existingItem) {
        const itemPrice = existingItem.price; // Capture price before modification

        if (existingItem.quantity === 1) {
           state.items = state.items.filter(item => item._id !== id);
        } else {
           existingItem.quantity--;
        }
        
        state.totalQuantity--;
        state.totalPrice -= itemPrice;
        state.isLoaded = true;
      }
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item._id === id);

      if (existingItem) {
        state.items = state.items.filter(item => item._id !== id);
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice -= (existingItem.price * existingItem.quantity);
      }
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