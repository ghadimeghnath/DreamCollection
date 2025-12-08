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
        
        // FIX: Handle both Array (Legacy) and Object (Paginated) responses
        let productList = [];
        
        if (Array.isArray(data)) {
            // Old format: just an array
            productList = data;
        } else if (data && Array.isArray(data.products)) {
            // New format: { products: [], pagination: {} }
            productList = data.products;
        }
        
        // 2. Dispatch success action with the extracted array
        dispatch(setProducts(productList));
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