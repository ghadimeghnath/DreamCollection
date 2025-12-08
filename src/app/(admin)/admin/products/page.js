import React from 'react';
import { getProducts } from '@/features/product/actions';
import AdminProductTable from '@/features/admin/components/AdminProductTable';

export const metadata = {
  title: "Product Management | Dream Collection",
};

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  
  const query = params?.query || '';
  const category = params?.category || '';
  const page = Number(params?.page) || 1;

  // Fetch data
  const { products, pagination } = await getProducts({ 
    query, 
    category, 
    page 
  });

  return (
    <div className='p-4 md:p-6 max-w-7xl mx-auto'>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         <div>
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-sm text-gray-500">Manage your inventory and catalog</p>
         </div>
         <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
            {pagination.totalItems} Items Found
         </div>
      </div>
      
      <AdminProductTable 
        initialProducts={products} 
        pagination={pagination}
      />
    </div>
  );
}