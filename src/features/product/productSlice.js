import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Standard synchronous actions
    setLoadingStatus: (state, action) => {
      state.status = action.payload;
    },
    setProducts: (state, action) => {
      state.list = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    resetProductState: (state) => {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    }
  },
});

export const { setLoadingStatus, setProducts, setError, resetProductState } = productSlice.actions;
export default productSlice.reducer;