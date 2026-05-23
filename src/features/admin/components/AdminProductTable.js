"use client";

import { deleteProduct } from "../actions";
import { Trash2, ExternalLink, Pencil, Search, Filter, ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react"; 
import { useToast } from "@/context/ToastContext";

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
                                <th className="px-3 py-3 md:px-6 text-center">Price</th>
                                <th className="px-3 py-3 md:px-6 text-center">Stock</th>
                                <th className="px-3 py-3 md:px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {initialProducts.length > 0 ? (
                                initialProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-3 py-3 md:px-6">
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                    {product.images?.[0] && (
                                                        <img 
                                                            src={product.images[0]} 
                                                            alt={product.name} 
                                                            className="h-full w-full object-cover mix-blend-multiply" 
                                                        />
                                                    )}
                                                </div>
                                                <div className="max-w-[150px] md:max-w-xs truncate">
                                                    <div className="font-medium text-gray-900 truncate">{product.name}</div>
                                                    <div className="text-xs text-gray-500">{product.year}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-gray-500">
                                            {product.series}
                                        </td>
                                        <td className="px-3 py-4 md:px-6 text-center font-medium text-gray-900">
                                            ${product.price}
                                        </td>
                                        <td className="px-3 py-4 md:px-6 text-center">
                                            {/* Numeric Stock Badge */}
                                            {product.stock > 0 ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock < 5 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                    {product.stock} Units
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 md:px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/edit/${product._id}`}>
                                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                                        <Pencil size={18} />
                                                    </button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle size={32} className="text-gray-300"/>
                                            <p>No products found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button 
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}