"use client";

import React, { useEffect } from "react";
import ProductCard from "./ProductCard";
import { useProductData } from "../hooks/useProductData";

function AllProducts() {
  const { products, status, error, fetchProductsIfIdle } = useProductData();

  useEffect(() => {
    fetchProductsIfIdle()
  }, [fetchProductsIfIdle]);

  if (status === 'loading' || status === 'idle') {
    return <div className="text-center py-10">Loading products...</div>;
  }
  
  if (status === 'failed') {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto -z-10'>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

export default AllProducts;