"use client";

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToCart, removeFromCart, decrementItem } from '../cartSlice';
import { Loader2, ShieldCheck, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'; // Added Icons

export default function Cart({ isValidating = false }) {
    const { items, totalPrice, totalQuantity } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();

    // Calculate Tax (2%) and Final Total based on Redux state
    const taxAmount = totalPrice * 0.02;
    const finalTotal = totalPrice + taxAmount;

    // Empty State
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                    <ShoppingBag className="text-gray-300" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any Hot Wheels yet.</p>
                <Link href="/">
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition font-medium">
                        Start Shopping
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row py-12 max-w-7xl w-full px-4 md:px-6 mx-auto gap-8 lg:gap-12 min-h-[calc(100vh-130px)]">
            <div className='flex-1'>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600 border border-gray-200">
                        {totalQuantity} Items
                    </span>
                </div>

                {/* Validation Banner */}
                {isValidating && (
                    <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm border border-indigo-100">
                        <Loader2 className="animate-spin" size={16} /> Verifying latest prices and inventory...
                    </div>
                )}

                {/* Table Headers */}
                <div className="hidden md:grid grid-cols-[3fr_1fr_1fr] text-gray-500 text-xs font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Quantity</p>
                    <p className="text-right">Total</p>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 mt-3 divide-y divide-gray-100 md:divide-none">
                    {items.map((item) => (
                        <div key={item._id} className="py-4 md:py-0 md:pt-3 md:pb-3 grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-4 md:items-center border-b border-gray-100 md:border-b text-gray-500 text-sm md:text-base font-medium last:border-0">
                            
                            {/* Product Detail */}
                            <div className="flex items-center md:gap-6 gap-3">
                                <div className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                                    <img className="w-full h-full object-contain mix-blend-multiply p-2" src={item.image} alt={item.name} />
                                </div>
                                <div className="flex flex-col justify-between h-full">
                                    <Link href={`/products/${item.slug || '#'}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition text-base line-clamp-1">
                                        {item.name}
                                    </Link>
                                    <div className="font-normal text-gray-500/80 mt-1 space-y-1">
                                        <p className="text-xs">{item.series} • {item.year}</p>
                                        <p className="text-xs md:hidden">Unit: ${item.price}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between md:justify-center">
                                <span className="md:hidden text-sm font-medium text-gray-900">Qty:</span>
                                <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white'>
                                    <button 
                                        onClick={() => dispatch(decrementItem(item._id))}
                                        className='px-3 py-1 hover:bg-gray-100 transition text-gray-600'
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className='px-2 text-sm font-semibold text-gray-900 min-w-[24px] text-center'>{item.quantity}</span>
                                    <button 
                                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                                        className='px-3 py-1 hover:bg-gray-100 transition text-gray-600 disabled:opacity-50'
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => dispatch(removeFromCart(item._id))}
                                    className="md:ml-6 text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded-full"
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Subtotal */}
                            <div className="flex justify-between items-center md:block md:text-right">
                                <span className="md:hidden text-sm font-medium text-gray-900">Subtotal:</span>
                                <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Link href="/">
                    <button className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:text-indigo-600 transition text-sm">
                        <svg className="group-hover:-translate-x-1 transition" width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Continue Shopping
                    </button>
                </Link>
            </div>

            {/* Summary Sidebar */}
            <div className="w-full lg:w-96 shrink-0">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-24 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                    
                    <div className="text-gray-600 space-y-4 text-sm pb-6 border-b border-gray-200">
                        <div className="flex justify-between">
                            <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span><span className="text-green-600 font-medium">Free</span>
                        </div>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-gray-900 mt-6 mb-8">
                        <span>Total Amount</span><span>${finalTotal.toFixed(2)}</span>
                    </div>

                    <Link href="/checkout">
                        <button className="w-full py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-[0.98]">
                            Proceed to Checkout
                        </button>
                    </Link>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span>Secure SSL Checkout</span>
                    </div>
                </div>
            </div>
        </div>
    );
}