"use server";

import dbConnect from '@/lib/db';
import Order from './models/Order';
import Cart from '@/features/cart/models/Cart';
import { revalidatePath } from 'next/cache';

export const createOrder = async (userId, orderData) => {
  await dbConnect();

  try {
    // 1. Fetch the user's persistent cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    // 2. Construct the Order Object
    // FIX: Map cart items to match Order Schema ( _id -> productId )
    const orderItems = cart.items.map(item => ({
      productId: item._id, // This mapping is crucial
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity
    }));

    const newOrder = await Order.create({
      userId,
      items: orderItems, 
      totalAmount: cart.totalPrice, 
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      status: 'Pending'
    });

    // 3. Clear the User's Cart
    await Cart.findOneAndUpdate({ userId }, { 
      items: [], 
      totalQuantity: 0, 
      totalPrice: 0 
    });

    // 4. Revalidate paths
    revalidatePath('/profile');
    revalidatePath('/cart');

    return { success: true, orderId: newOrder._id.toString() };

  } catch (error) {
    console.error("Checkout Error:", error);
    return { error: "Failed to place order. Please try again." };
  }
};