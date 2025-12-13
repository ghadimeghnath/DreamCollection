"use server";

import dbConnect from '@/lib/db';
import Order from '@/features/order/models/Order';
import { getStoreSettings } from '@/features/admin/settings/actions';
import { initiatePayment } from '@/lib/payment-adapters';

export const processPayment = async (orderId) => {
  await dbConnect();

  try {
    // 1. Fetch Order
    const order = await Order.findById(orderId);
    if (!order) return { error: "Order not found" };

    // 2. Fetch Store Settings (contains keys)
    const settings = await getStoreSettings();

    // 3. Validate Amount
    if (order.totalAmount <= 0) return { error: "Invalid order amount" };

    // 4. Handle Manual Gateways (COD, WhatsApp)
    // These don't need a payment provider session
    if (order.paymentMethod === 'cod' || order.paymentMethod === 'whatsapp') {
        return { success: true, type: 'manual', message: 'Order placed successfully' };
    }

    // 5. Initiate Payment via Adapter
    const paymentData = await initiatePayment(order.paymentMethod, order, settings);

    return { success: true, ...paymentData };

  } catch (error) {
    console.error("Payment Processing Error:", error);
    return { error: error.message || "Payment initialization failed" };
  }
};