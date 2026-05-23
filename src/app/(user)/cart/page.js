"use client";

import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { validateCart } from '@/features/cart/actions';
import { setCart } from '@/features/cart/cartSlice';
import { useToast } from '@/context/ToastContext';
import Cart from '@/features/cart/components/Cart';

export default function CartPage() {
    const { items } = useAppSelector((state) => state.cart);
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
                // Update Redux with the "clean" cart from server (contains updated stock/prices)
                dispatch(setCart(result.cart));
            }
            
            setIsValidating(false);
        };

        syncCart();
    }, []); // Run once on mount

    return (
        <div className="bg-white min-h-screen">
            <Cart isValidating={isValidating} />
        </div>
    );
}