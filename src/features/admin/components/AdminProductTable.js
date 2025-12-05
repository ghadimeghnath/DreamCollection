"use client";

import { deleteProduct } from "../actions";
import { Trash2, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

export default function AdminProductTable({ initialProducts }) {
    const handleDelete = async (id) => {
        if(confirm("Are you sure you want to delete this product?")) {
            await deleteProduct(id);
        }
    }

    return (
        <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-500 whitespace-nowrap">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="px-4 py-3 md:px-6">Product</th>
                            <th className="px-6 py-3 hidden md:table-cell">Category</th>
                            <th className="px-6 py-3 hidden lg:table-cell">Series</th>
                            <th className="px-4 py-3 md:px-6">Price</th>
                            <th className="px-6 py-3 hidden sm:table-cell">Stock</th>
                            <th className="px-4 py-3 text-right md:px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {initialProducts.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 md:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                                            <img 
                                                src={product.images?.[0] || "/hotwheel.svg"} 
                                                alt="" 
                                                className="h-full w-full object-contain" 
                                            />
                                        </div>
                                        <div className="flex flex-col max-w-[140px] md:max-w-[200px]">
                                            <span className="font-medium text-gray-900 truncate" title={product.name}>
                                                {product.name}
                                            </span>
                                            <span className="text-xs text-gray-400 md:hidden">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">{product.category}</td>
                                <td className="px-6 py-4 hidden lg:table-cell">{product.series}</td>
                                <td className="px-4 py-4 font-medium text-gray-900 md:px-6">
                                    ${product.price}
                                </td>
                                <td className="px-6 py-4 hidden sm:table-cell">
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${product.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {product.inStock ? 'In Stock' : 'Out'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right md:px-6">
                                    <div className="flex justify-end gap-1 md:gap-2">
                                        <Link href={`/admin/edit/${product._id}`}>
                                            <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition" title="Edit">
                                                <Pencil size={16} />
                                            </button>
                                        </Link>
                                        <Link href={`/products/${product.slug}`} target="_blank" className="hidden sm:inline-block">
                                            <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 transition" title="View">
                                                <ExternalLink size={16} />
                                            </button>
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(product._id)}
                                            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"
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
                                <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                                    No products found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}