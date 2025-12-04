"use server";

import dbConnect from '@/lib/db';
import Cart from './models/Cart';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config"; // Ensure this path points to your NextAuth config

// 1. Get Cart from DB (Called on login/page load)
export const fetchCart = async (userId) => {
  if (!userId) return null;
  
  try {
    await dbConnect();
    const cart = await Cart.findOne({ userId }).lean();
    
    if (cart) {
      return {
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return null;
  }
};

// 2. Save Cart to DB (Called whenever Redux state changes)
export const saveCartToDB = async (userId, cartData) => {
  if (!userId) return;

  try {
    await dbConnect();
    
    // Upsert: Update if exists, Create if not
    await Cart.findOneAndUpdate(
      { userId },
      { 
        userId,
        items: cartData.items,
        totalQuantity: cartData.totalQuantity,
        totalPrice: cartData.totalPrice
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};