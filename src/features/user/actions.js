"use server";

import dbConnect from '@/lib/db';
import Address from './models/Address';
import Order from '@/features/order/models/Order';
import { revalidatePath } from 'next/cache';

// --- Address Actions ---

export const getUserAddresses = async (userId) => {
  await dbConnect();
  const addresses = await Address.find({ userId }).lean();
  
  // FIX: Manually serialize ObjectId and Date fields to strings
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
  
  // Enforce Max 2 rule
  const count = await Address.countDocuments({ userId });
  if (count >= 2) {
    return { error: "Maximum of 2 addresses allowed." };
  }

  await Address.create({ userId, ...addressData });
  revalidatePath('/profile');
  return { success: true };
};

export const updateAddress = async (userId, addressId, addressData) => {
  await dbConnect();

  // Find and update strictly checking userId for security
  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, userId }, 
    { ...addressData },
    { new: true }
  );

  if (!updatedAddress) {
    return { error: "Address not found or unauthorized." };
  }

  revalidatePath('/profile');
  return { success: true };
};

export const deleteAddress = async (addressId) => {
  await dbConnect();
  await Address.findByIdAndDelete(addressId);
  revalidatePath('/profile');
  return { success: true };
};

// --- Order Actions ---

export const getUserOrders = async (userId) => {
  await dbConnect();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
  
  // FIX: Serialize userId, dates, and nested item IDs
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