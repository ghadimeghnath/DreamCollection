"use server";

import dbConnect from '@/lib/db';
import Order from '@/features/order/models/Order';
import { getStoreSettings } from '@/features/admin/settings/actions';
import { initiatePayment } from '@/lib/payment-adapters';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

export const processPayment = async (orderId) => {
  await dbConnect();

  try {
    // 0. Security Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return { error: "Unauthorized. Please login." };
    }

    // 1. Fetch Order
    const order = await Order.findById(orderId);
    if (!order) return { error: "Order not found" };

    // 2. Ownership Check
    if (order.userId.toString() !== session.user.id) {
        return { error: "Unauthorized access to order." };
    }

    // 3. Fetch Store Settings (contains keys)
    // Note: getStoreSettings is internal here, so it's safe to use to get secrets on the server
    const settings = await getStoreSettings(false);

    // 4. Validate Amount
    if (order.totalAmount <= 0) return { error: "Invalid order amount" };

    // 5. Handle Manual Gateways (COD, WhatsApp)
    if (order.paymentMethod === 'cod' || order.paymentMethod === 'whatsapp') {
        return { success: true, type: 'manual', message: 'Order placed successfully' };
    }

    // 6. Initiate Payment via Adapter
    const paymentData = await initiatePayment(order.paymentMethod, order, settings);

    return { success: true, ...paymentData };

  } catch (error) {
    console.error("Payment Processing Error:", error);
    return { error: error.message || "Payment initialization failed" };
  }
};