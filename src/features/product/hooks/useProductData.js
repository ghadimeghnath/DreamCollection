import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks'; 
import { setLoadingStatus, setProducts, setError } from '../productSlice';
import { getProducts } from '../actions'; // Importing the Server Action

export const useProductData = () => {
  const products = useAppSelector((state) => state.product.list);
  const status = useAppSelector((state) => state.product.status);
  const error = useAppSelector((state) => state.product.error);
  
  const dispatch = useAppDispatch();

  const fetchProductsIfIdle = useCallback(async () => {
    // Only fetch if we haven't already
    if (status === 'idle') {
      dispatch(setLoadingStatus('loading'));
      
      try {
        // 1. Call the Server Action directly
        const data = await getProducts();
        
        // 2. Dispatch success action with data
        dispatch(setProducts(data));
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // 3. Dispatch error action
        dispatch(setError(err.message || 'Failed to fetch products'));
      }
    }
  }, [status, dispatch]);

  return {
    products,
    status,
    error,
    fetchProductsIfIdle,
  };
};