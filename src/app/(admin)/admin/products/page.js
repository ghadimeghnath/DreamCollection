import React from 'react';
import { getProducts } from '@/features/product/actions';
import AdminProductTable from '@/features/admin/components/AdminProductTable';
import Link from 'next/link';
import { Plus } from 'lucide-react';

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
    <div className=' md:p-6 max-w-7xl mx-auto'>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
         {/* Title Section */}
         <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Products</h1>
            <p className="text-sm text-gray-500">Manage your inventory and catalog</p>
         </div>

         {/* Actions Section */}
         <div className="flex items-center gap-3 w-full md:w-auto">
             {/* Count Badge - Hidden on very small screens to save space if needed, or kept visible */}
             <div className="hidden sm:block bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium border border-indigo-100 whitespace-nowrap">
                {pagination.totalItems} Found
             </div>
             
             {/* Add Button */}
             <Link href="/admin/add" className="w-full md:w-auto">
                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm active:scale-95">
                    <Plus size={18} />
                    <span>Add Product</span>
                </button>
             </Link>
         </div>
      </div>
      
      <AdminProductTable 
        initialProducts={products} 
        pagination={pagination}
      />
    </div>
  );
}