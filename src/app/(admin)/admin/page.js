import React from 'react';
import { getProducts } from '@/features/product/actions';
import AdminProductTable from '@/features/admin/components/AdminProductTable';

export const metadata = {
  title: "Admin Dashboard | Dream Collection",
};

export default async function AdminDashboard() {
  // Reuse the existing fetch action
  const products = await getProducts();

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
         <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
            {products.length} Items
         </span>
      </div>
      
      {/* Extract Client Logic to separate component */}
      <AdminProductTable initialProducts={products} />
    </div>
  );
}