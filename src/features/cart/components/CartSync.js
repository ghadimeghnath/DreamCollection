"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCart, saveCartToDB, syncLocalCartWithServer } from "../actions";
import { setCart } from "../cartSlice";

export default function CartSync() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  
  const isInitialMount = useRef(true);
  const hasSyncedLogin = useRef(false);

  // 1. LOAD & MERGE Logic
  useEffect(() => {
    // ✅ FIX: Only run if session changes (Login), NOT when cart items change
    if (session?.user?.id && !hasSyncedLogin.current) {
      const initializeCart = async () => {
        hasSyncedLogin.current = true; 

        if (cart.items.length > 0) {
            console.log("Merging guest cart with server...");
            const mergedCart = await syncLocalCartWithServer(session.user.id, cart.items);
            if (mergedCart) dispatch(setCart(mergedCart));
        } else {
            console.log("Fetching server cart...");
            const dbCart = await fetchCart(session.user.id);
            if (dbCart) dispatch(setCart(dbCart));
        }
      };
      initializeCart();
    }
    // ❌ REMOVED: cart.items.length (This was causing the loop/overwrite)
  }, [session?.user?.id, dispatch]); 

  // 2. SAVE (Debounced) - Keeps your existing save logic
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (session?.user?.id && cart.isLoaded) {
      const timer = setTimeout(() => {
        saveCartToDB(session.user.id, {
          items: cart.items,
          totalQuantity: cart.totalQuantity,
          totalPrice: cart.totalPrice
        });
      }, 1000); 

      return () => clearTimeout(timer);
    }
  }, [cart, session?.user?.id]);

  return null;
}