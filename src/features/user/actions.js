"use server";

import dbConnect from '@/lib/db';
import Address from './models/Address';
import Order from '@/features/order/models/Order';
import { User } from '@/features/auth/models/User';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

// Helper for User Authorization
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please sign in.");
  }
  return session.user;
}

// --- User Profile Actions ---

export const updateUserProfile = async (userId, data) => {
  await dbConnect();
  
  try {
    const currentUser = await getAuthenticatedUser();
    
    // Authorization Check
    if (currentUser.id !== userId) {
      throw new Error("Unauthorized access to profile.");
    }

    // Prevent updating email/password/isAdmin via this route
    const { email, password, isAdmin, ...safeData } = data;
    
    await User.findByIdAndUpdate(userId, safeData);
    
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: error.message || "Failed to update profile." };
  }
};

// --- Address Actions ---

export const getUserAddresses = async (userId) => {
  await dbConnect();
  const currentUser = await getAuthenticatedUser();

  if (currentUser.id !== userId) {
    // Return empty if trying to access someone else's addresses
    return [];
  }

  const addresses = await Address.find({ userId }).lean();
  
  return addresses.map(addr => ({
    ...addr,
    _id: addr._id.toString(),
    userId: addr.userId.toString(),
    createdAt: addr.createdAt?.toISOString(),
    updatedAt: addr.updatedAt?.toISOString(),
  }));
};

export const addAddress = async (userId, addressData) => {
  await dbConnect();
  try {
    const currentUser = await getAuthenticatedUser();

    if (currentUser.id !== userId) {
       throw new Error("Unauthorized.");
    }

    // Enforce Max 2 rule
    const count = await Address.countDocuments({ userId });
    if (count >= 2) {
      return { error: "Maximum of 2 addresses allowed." };
    }

    await Address.create({ userId, ...addressData });
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
      return { error: error.message };
  }
};

export const updateAddress = async (userId, addressId, addressData) => {
  await dbConnect();
  try {
    const currentUser = await getAuthenticatedUser();
    
    if (currentUser.id !== userId) {
        throw new Error("Unauthorized.");
    }

    // Security: Ensure the address actually belongs to this user in the query
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, userId: currentUser.id }, 
      { ...addressData },
      { new: true }
    );

    if (!updatedAddress) {
      return { error: "Address not found or unauthorized." };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch(error) {
      return { error: error.message };
  }
};

export const deleteAddress = async (addressId) => {
  await dbConnect();
  try {
    const currentUser = await getAuthenticatedUser();
    
    // Security: Only delete if it matches the ID AND the current user's ID
    const deleted = await Address.findOneAndDelete({ 
        _id: addressId, 
        userId: currentUser.id 
    });

    if (!deleted) return { error: "Address not found or unauthorized." };

    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
      return { error: "Failed to delete address" };
  }
};

// --- Order Actions ---

export const getUserOrders = async (userId) => {
  await dbConnect();
  
  // Note: We don't throw here to avoid crashing UI if session is stale, just return empty
  const session = await getServerSession(authOptions);
  if (!session || session.user.id !== userId) {
      return [];
  }

  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  
  return orders.map(order => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId.toString(),
    createdAt: order.createdAt?.toISOString(),
    updatedAt: order.updatedAt?.toISOString(),
    items: order.items.map(item => ({
        ...item, 
        _id: item._id?.toString() 
    }))
  }));
};