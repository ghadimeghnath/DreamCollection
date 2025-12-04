"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCart, saveCartToDB } from "../actions";
import { setCart } from "../cartSlice";

export default function CartSync() {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  
  // Ref to track if this is the first mount to avoid overwriting DB with empty Redux
  const isInitialMount = useRef(true);

  // 1. LOAD: When user logs in, fetch their cart from DB
  useEffect(() => {
    if (session?.user?.id) {
      const loadCart = async () => {
        const dbCart = await fetchCart(session.user.id);
        if (dbCart) {
          dispatch(setCart(dbCart));
        }
      };
      loadCart();
    }
  }, [session?.user?.id, dispatch]);

  // 2. SAVE: When Redux cart changes, save to DB (Debounced slightly)
  useEffect(() => {
    // Don't save if it's the first mount (avoids wiping DB with empty init state)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if user is logged in
    if (session?.user?.id && cart.isLoaded) {
      const timer = setTimeout(() => {
        saveCartToDB(session.user.id, {
          items: cart.items,
          totalQuantity: cart.totalQuantity,
          totalPrice: cart.totalPrice
        });
      }, 1000); // 1-second debounce to reduce DB writes

      return () => clearTimeout(timer);
    }
  }, [cart, session?.user?.id]);

  return null; // This component renders nothing
}