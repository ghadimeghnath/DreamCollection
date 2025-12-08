"use client";

import { deleteProduct } from "../actions";
import { Trash2, ExternalLink, Pencil, Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react"; 
import { useToast } from "@/context/ToastContext"; // Import toast

export default function AdminProductTable({ initialProducts, pagination }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { addToast } = useToast();

    // Local state for immediate UI feedback
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');

    // Debounce Search Logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch(searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const updateUrl = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset to page 1 on filter change
        if (key !== 'page') {
            params.set('page', 1);
        }
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleSearch = (term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        params.set('page', 1); // Reset page
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        updateUrl('category', e.target.value);
    };

    const handlePageChange = (newPage) => {
        updateUrl('page', newPage);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        router.replace(pathname);
    };

    const handleDelete = async (id) => {
        if(confirm("Are you sure you want to delete this product?")) {
            const res = await deleteProduct(id);
            if (res.success) {
                addToast("Product deleted successfully", "success");
            } else {
                addToast("Failed to delete product", "error");
            }
        }
    }

    return (
        <div className="space-y-4 w-full max-w-[100vw]">
            {/* --- Toolbar --- */}
            <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select 
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Muscle">Muscle</option>
                            <option value="Exotic">Exotic</option>
                            <option value="JDM">JDM</option>
                            <option value="Trucks">Trucks</option>
                            <option value="Fantasy">Fantasy</option>
                        </select>
                    </div>

                    {(searchTerm || categoryFilter) && (
                        <button 
                            onClick={handleClearFilters}
                            className="w-full sm:w-auto justify-center px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-1 border border-red-200"
                        >
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* --- Table --- */}
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="w-full overflow-x-auto scrollbar-thin">
                    <table className="min-w-full text-left text-sm text-gray-500 whitespace-nowrap">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-3 py-3 md:px-6">Product</th>
                                <th className="px-6 py-3 hidden md:table-cell">Category</th>
                                <th className="px-6 py-3 hidden lg:table-cell">Series</th>
                                <th className="px-3 py-3 md:px-6">Price</th>
                                <th className="px-6 py-3 hidden sm:table-cell">Stock</th>
                                <th className="px-3 py-3 text-right md:px-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {initialProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-4 md:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                                                <img 
                                                    src={product.images?.[0] || "/placeholder.png"} 
                                                    alt="" 
                                                    className="h-full w-full object-contain" 
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[140px] md:max-w-[200px]">
                                                <span className="font-medium text-gray-900 truncate" title={product.name}>
                                                    {product.name}
                                                </span>
                                                <span className="text-xs text-gray-400 md:hidden truncate">
                                                    {product.category}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell text-gray-500">{product.series}</td>
                                    <td className="px-3 py-4 font-medium text-gray-900 md:px-6">
                                        ${product.price}
                                    </td>
                                    <td className="px-6 py-4 hidden sm:table-cell">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.inStock ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'}`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 text-right md:px-6">
                                        <div className="flex justify-end gap-1 md:gap-2">
                                            <Link href={`/admin/edit/${product._id}`}>
                                                <button className="rounded-md p-1.5 md:p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition" title="Edit">
                                                    <Pencil size={16} />
                                                </button>
                                            </Link>
                                            <Link href={`/products/${product.category}/${product.slug}`} target="_blank" className="hidden sm:inline-block">
                                                <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition" title="View">
                                                    <ExternalLink size={16} />
                                                </button>
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product._id)}
                                                className="rounded-md p-1.5 md:p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {initialProducts.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20" />
                                            <p>No products found matching your filters.</p>
                                            <button 
                                                onClick={handleClearFilters}
                                                className="text-indigo-600 hover:underline text-sm font-medium"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination Footer --- */}
                {pagination.totalPages > 1 && (
                    <div className="border-t border-gray-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-3 sm:gap-0">
                        <p className="text-sm text-gray-500 hidden sm:block">
                            Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span> of <span className="font-medium">{pagination.totalItems}</span> results
                        </p>
                        
                        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            
                            <span className="text-sm font-medium text-gray-700 flex items-center sm:hidden">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}