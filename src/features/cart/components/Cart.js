"use client";

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToCart, removeFromCart, decrementItem } from '../cartSlice';

export default function Cart() {
    // Removed unused local state for dummy address
    const { items, totalPrice, totalQuantity } = useAppSelector((state) => state.cart);
    const dispatch = useAppDispatch();

    // Calculate Tax (2%) and Final Total based on Redux state
    const taxAmount = totalPrice * 0.02;
    const finalTotal = totalPrice + taxAmount;

    // Empty State
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
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
        <div className="flex flex-col md:flex-row py-16 max-w-7xl w-full px-6 mx-auto gap-8">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-indigo-500">{totalQuantity} Items</span>
                </h1>

                {/* Table Headers */}
                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-200">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {/* Cart Items */}
                <div className="flex flex-col gap-4 mt-3">
                    {items.map((item) => (
                        <div key={item._id} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3 pb-3 border-b border-gray-100 last:border-0">
                            
                            {/* Product Detail Column */}
                            <div className="flex items-center md:gap-6 gap-3">
                                <div className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-300 rounded overflow-hidden shrink-0">
                                    <img className="w-full h-full object-cover mix-blend-multiply" src={item.image} alt={item.name} />
                                </div>
                                <div>
                                    <Link href={`/products/${item.slug || '#'}`} className="hidden md:block font-semibold text-gray-900 hover:text-indigo-600 transition">
                                        {item.name}
                                    </Link>
                                    <div className="font-normal text-gray-500/70 mt-1">
                                        {/* Optional: Add Size here if you add it to schema later */}
                                        <p className="text-xs mb-1">Unit: ${item.price}</p>
                                        <div className='flex items-center gap-2'>
                                            <p>Qty:</p>
                                            <div className='flex items-center border border-gray-300 rounded overflow-hidden bg-white'>
                                                <button 
                                                    onClick={() => dispatch(decrementItem(item._id))}
                                                    className='px-2 py-0.5 hover:bg-gray-100 transition text-gray-700'
                                                >
                                                    -
                                                </button>
                                                <span className='px-2 text-sm text-gray-900 min-w-[20px] text-center'>{item.quantity}</span>
                                                <button 
                                                    onClick={() => dispatch(addToCart({ ...item, quantity: 1 }))}
                                                    className='px-2 py-0.5 hover:bg-gray-100 transition text-gray-700'
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subtotal Column */}
                            <p className="text-center font-semibold text-gray-900">${item.price * item.quantity}</p>

                            {/* Action Column */}
                            <button 
                                onClick={() => dispatch(removeFromCart(item._id))}
                                className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded-full transition group"
                                aria-label="Remove item"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path className="group-hover:stroke-red-600 transition" d="m12.5 7.5-5 5m0-5 5 5m5.833-2.5a8.333 8.333 0 1 1-16.667 0 8.333 8.333 0 0 1 16.667 0" stroke="#FF532E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Continue Shopping */}
                <Link href="/">
                    <button className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium hover:text-indigo-600 transition">
                        <svg className="group-hover:-translate-x-1 transition" width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.09 5.5H1M6.143 10 1 5.5 6.143 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Continue Shopping
                    </button>
                </Link>

            </div>

            {/* Order Summary Sidebar */}
            <div className="max-w-[360px] w-full bg-gray-50 p-6 h-fit rounded-lg border border-gray-200">
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                <hr className="border-gray-200 mb-6" />

                <div className="text-gray-600 space-y-3 text-sm">
                    <p className="flex justify-between">
                        <span>Subtotal</span><span>${totalPrice}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600 font-medium">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>${taxAmount.toFixed(2)}</span>
                    </p>
                    <div className="h-px bg-gray-200 my-2"></div>
                    <p className="flex justify-between text-lg font-bold text-gray-900">
                        <span>Total Amount</span><span>${finalTotal.toFixed(2)}</span>
                    </p>
                </div>

                <Link href="/checkout">
                    <button className="w-full py-3 mt-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md">
                        Proceed to Checkout
                    </button>
                </Link>
                
                <p className="text-xs text-gray-400 text-center mt-4">
                    Shipping & taxes calculated at checkout
                </p>
            </div>
        </div>
    );
}