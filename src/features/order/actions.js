"use server";

import dbConnect, { withTransaction } from '@/lib/db';
import Order from './models/Order';
import Cart from '@/features/cart/models/Cart';
import Product from '@/features/product/models/Product';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export const createOrder = async (userId, orderData) => {
  return await withTransaction(async (session) => {
      // 0. Security Check
      const userSession = await getServerSession(authOptions);
      if (!userSession || !userSession.user) {
          throw new Error("You must be logged in to place an order.");
      }
      
      if (userSession.user.id !== userId) {
          throw new Error("Unauthorized: Invalid User Session.");
      }

      // 1. Validation
      const addr = orderData.shippingAddress;
      if (!addr || !addr.street || !addr.city || !addr.zip || !addr.state || !addr.country) {
          throw new Error("Please provide a complete shipping address.");
      }

      // 2. Fetch User Cart (with Population)
      // ✅ FIX: Populate 'items.productId' to get the Real Product Object
      const cart = await Cart.findOne({ userId })
          .populate('items.productId')
          .session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems = [];
      let calculatedTotal = 0;
      
      // 3. Check Stock & Decrement Inventory
      for (const item of cart.items) {
          // ✅ FIX: The product is now inside 'item.productId' due to population
          const product = item.productId;
          
          // Check if product was deleted (it becomes null if missing)
          if (!product) {
              throw new Error(`One of the items in your cart no longer exists. Please clear your cart.`);
          }
          
          // Strict numeric stock check
          if (product.stock < item.quantity) {
               throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} left.`);
          }
          
          // Atomically decrement stock on the PRODUCT document
          product.stock -= item.quantity;
          
          if (product.stock === 0) {
              product.inStock = false;
          }
          
          await product.save({ session });
          
          // ✅ FIX: Use properties from the 'product' object, not the 'item' wrapper
          const validPrice = product.price;
          calculatedTotal += validPrice * item.quantity;

          orderItems.push({
            productId: product._id, // Real Product ID
            name: product.name,     // Name from Product DB
            price: validPrice,      // Price from Product DB
            image: product.images?.[0] || "",
            quantity: item.quantity
          });
      }

      // 4. Create Order
      const newOrder = new Order({
        userId,
        items: orderItems, 
        totalAmount: calculatedTotal,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        status: 'Pending',
        paymentStatus: 'Pending'
      });
      
      await newOrder.save({ session });

      // Note: We DO NOT clear the cart here (waiting for webhook success)
      
      revalidatePath('/profile');

      return { success: true, orderId: newOrder._id.toString() };
  }).catch(error => {
      console.error("Create Order Error:", error);
      return { error: error.message || "Failed to place order." };
  });
};

export const cancelOrderAndRestoreStock = async (orderId, reason = "Cancelled") => {
  await dbConnect();
  
  const order = await Order.findById(orderId);
  if (!order) return { error: "Order not found" };

  if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return { error: `Cannot cancel order in ${order.status} state.` };
  }

  try {
      for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
              $inc: { stock: item.quantity },
              $set: { inStock: true }
          });
      }

      order.status = 'Cancelled';
      await order.save();

      revalidatePath('/admin/orders');
      revalidatePath('/profile');
      
      return { success: true, message: "Order cancelled and stock restored." };

  } catch (error) {
      console.error("Restoration Error:", error);
      return { error: "Failed to restore stock" };
  }
};