"use server";

import dbConnect from '@/lib/db';
import Order from './models/Order';
import Cart from '@/features/cart/models/Cart';
import { revalidatePath } from 'next/cache';

export const createOrder = async (userId, orderData) => {
  await dbConnect();

  try {
    // 1. Validation: Ensure Shipping Address is present
    const addr = orderData.shippingAddress;
    if (!addr || !addr.street || !addr.city || !addr.zip || !addr.state || !addr.country) {
        return { error: "Please provide a complete shipping address before placing order." };
    }

    // 2. Fetch the user's persistent cart
    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    // 3. Construct the Order Object
    const orderItems = cart.items.map(item => ({
      productId: item._id, // Map _id to productId
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

    // 4. Clear the User's Cart
    await Cart.findOneAndUpdate({ userId }, { 
      items: [], 
      totalQuantity: 0, 
      totalPrice: 0 
    });

    revalidatePath('/profile');
    revalidatePath('/cart');

    return { success: true, orderId: newOrder._id.toString() };

  } catch (error) {
    console.error("Checkout Error:", error);
    return { error: "Failed to place order. Please try again." };
  }
};