"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToCart, removeFromCart, decrementItem, setCart } from '@/features/cart/cartSlice';
import { validateCart } from '@/features/cart/actions';
import { useToast } from '@/context/ToastContext';
import { Trash2, Plus, Minus, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

export default function CartPage() {
    const { items, totalPrice, totalQuantity } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();
    const { addToast } = useToast();
    const [isValidating, setIsValidating] = useState(true);

    // Sync & Validate on Mount
    useEffect(() => {
        const syncCart = async () => {
            if (items.length === 0) {
                setIsValidating(false);
                return;
            }

            // Call Server to validate prices/stock
            const result = await validateCart(items);
            
            // If server returns warnings, show them
            if (result.warnings.length > 0) {
                result.warnings.forEach(msg => addToast(msg, "warning"));
                // Update Redux with the "clean" cart from server
                dispatch(setCart(result.cart));
            }
            
            setIsValidating(false);
        };

        syncCart();
    }, []); // Run once on mount

    const taxAmount = totalPrice * 0.02;
    const finalTotal = totalPrice + taxAmount;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[calc(100vh-130px)]">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="text-gray-400" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added any Hot Wheels yet. Start collecting to fill it up!</p>
                <Link href="/">
                    <button className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition font-medium">
                        Start Shopping
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row py-12 max-w-7xl w-full px-6 mx-auto gap-8 lg:gap-12 min-h-[calc(100vh-130px)]">
            <div className='flex-1 max-w-4xl'>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Shopping Cart
                    </h1>
                    <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                        {totalQuantity} Items
                    </span>
                </div>

                {isValidating && (
                    <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
                        <Loader2 className="animate-spin" size={16} /> Verifying latest prices and stock...
                    </div>
                )}

                {/* Header Row */}
                <div className="hidden md:grid grid-cols-[3fr_1fr_1fr] text-gray-500 text-xs font-semibold uppercase tracking-wider pb-3 border-b border-gray-200">
                    <p>Product</p>
                    <p className="text-center">Quantity</p>
                    <p className="text-right">Total</p>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col divide-y divide-gray-100">
                    {items.map((item) => (
                        <div key={item._id} className="py-6 grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr] gap-4 md:items-center">
                            
                            {/* Product Info */}
                            <div className="flex gap-4">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                    <img className="w-full h-full object-cover mix-blend-multiply" src={item.image} alt={item.name} />
                                </div>
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <Link href={`/products/all/${item.slug || '#'}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition line-clamp-1">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">{item.series} • {item.year}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 md:hidden">${item.price}</p>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center md:justify-center">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                                    <button 
                                        onClick={() => dispatch(decrementItem(item._id))}
                                        className="px-3 py-1.5 hover:bg-gray-50 transition text-gray-600 active:bg-gray-200"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-3 text-sm font-semibold text-gray-900 min-w-[2rem] text-center bg-white">
                                        {item.quantity}
                                    </span>
                                    <button 
                                        onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                                        className="px-3 py-1.5 hover:bg-gray-50 transition text-gray-600 active:bg-gray-200"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => dispatch(removeFromCart(item._id))}
                                    className="ml-auto md:hidden text-red-500 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            {/* Price & Remove (Desktop) */}
                            <div className="hidden md:flex items-center justify-end gap-6">
                                <p className="font-bold text-gray-900 text-lg">${item.price * item.quantity}</p>
                                <button 
                                    onClick={() => dispatch(removeFromCart(item._id))}
                                    className="text-gray-400 hover:text-red-600 transition p-2 rounded-full hover:bg-red-50"
                                    title="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <Link href="/" className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition group">
                        <ArrowRight className="mr-2 h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:w-96 shrink-0">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                    <h2 className="text-lg font-bold mb-6 text-gray-900">Order Summary</h2>
                    
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (2%)</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="h-px bg-gray-200 my-4"></div>
                        
                        <div className="flex justify-between items-end">
                            <span className="font-semibold text-gray-900 text-base">Total</span>
                            <span className="font-bold text-2xl text-gray-900">${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Link href="/checkout">
                        <button 
                            disabled={isValidating}
                            className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isValidating ? (
                                <><Loader2 className="animate-spin" size={20} /> Updating...</>
                            ) : (
                                <>Proceed to Checkout <ArrowRight size={20} /></>
                            )}
                        </button>
                    </Link>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">
                        <span className="inline-block mr-1">🔒</span> Secure Checkout
                    </p>
                </div>
            </div>
        </div>
    );
}