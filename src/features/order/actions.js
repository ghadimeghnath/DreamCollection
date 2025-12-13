"use server";

import dbConnect, { withTransaction } from '@/lib/db';
import Order from './models/Order';
import Cart from '@/features/cart/models/Cart';
import Product from '@/features/product/models/Product';
import { revalidatePath } from 'next/cache';

export const createOrder = async (userId, orderData) => {
  // Use our robust transaction helper (retries on standalone DB)
  return await withTransaction(async (session) => {
      // 1. Validation
      const addr = orderData.shippingAddress;
      if (!addr || !addr.street || !addr.city || !addr.zip || !addr.state || !addr.country) {
          throw new Error("Please provide a complete shipping address.");
      }

      // 2. Fetch User Cart
      const cart = await Cart.findOne({ userId }).session(session);

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      const orderItems = [];
      
      // 3. Check Stock & Decrement Inventory
      for (const item of cart.items) {
          const product = await Product.findById(item._id).session(session);
          
          if (!product) {
              throw new Error(`Product "${item.name}" no longer exists.`);
          }
          
          if (!product.inStock) {
               throw new Error(`"${product.name}" is out of stock.`);
          }
          
          // Decrement logic (assuming boolean inStock for now, but ready for numeric)
          // If you add numeric stock: product.stock -= item.quantity;
          
          await product.save({ session });
          
          orderItems.push({
            productId: item._id, 
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          });
      }

      // 4. Create Order
      const newOrder = new Order({
        userId,
        items: orderItems, 
        totalAmount: cart.totalPrice, 
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        status: 'Pending',
        paymentStatus: 'Pending'
      });
      
      await newOrder.save({ session });

      // 5. Clear Cart
      cart.items = [];
      cart.totalQuantity = 0;
      cart.totalPrice = 0;
      await cart.save({ session });

      revalidatePath('/profile');
      revalidatePath('/cart');

      return { success: true, orderId: newOrder._id.toString() };
  }).catch(error => {
      console.error("Create Order Error:", error);
      return { error: error.message || "Failed to place order." };
  });
};