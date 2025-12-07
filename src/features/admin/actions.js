"use server";

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import Order from '@/features/order/models/Order';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';
import { createShiprocketOrder, generateAWB, generateLabel, cancelShipment } from '@/lib/shiprocket';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Product Actions ---
export async function uploadImage(formData) {
  const file = formData.get('file');
  if (!file) return { error: "No file provided" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "hotwheels-store" }, (error, result) => {
          if (error) reject(error); else resolve(result);
        }).end(buffer);
    });
    return { success: true, url: result.secure_url };
  } catch (error) { return { error: "Image upload failed" }; }
}

export const getProductById = async (id) => {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if(!product) return null;
    return { ...product, _id: product._id.toString() };
}

export const addProduct = async (productData) => {
  await dbConnect();
  try {
    const slug = productData.slug || productData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    await Product.create({ ...productData, slug });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) { return { error: error.message || "Failed to add product" }; }
};

export const updateProduct = async (id, productData) => {
    await dbConnect();
    try {
        await Product.findByIdAndUpdate(id, productData);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) { return { error: "Failed to update product" }; }
}

export const deleteProduct = async (productId) => {
  await dbConnect();
  try {
    await Product.findByIdAndDelete(productId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) { return { error: "Failed to delete product" }; }
};

// --- Order Actions ---

export const getAllOrders = async () => {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return orders.map(order => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId.toString(),
    createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    items: order.items.map(item => ({...item, _id: item._id?.toString() }))
  }));
};

export const updateOrderStatus = async (orderId, newStatus) => {
  await dbConnect();
  await Order.findByIdAndUpdate(orderId, { status: newStatus });
  revalidatePath('/admin/orders');
  return { success: true };
};

export const shipOrder = async (orderId) => {
  await dbConnect();
  try {
    const order = await Order.findById(orderId);
    if (!order) return { error: "Order not found" };

    const addr = order.shippingAddress;
    if (!addr || !addr.street || !addr.city || !addr.state || !addr.zip || !addr.country) {
        return { error: "Shipping Failed: Address incomplete." };
    }

    const srResponse = await createShiprocketOrder(order);

    if (srResponse.error) return { error: srResponse.error };

    if (srResponse.shipment_id) {
        order.shiprocketOrderId = srResponse.order_id;
        order.shipmentId = srResponse.shipment_id;
        order.status = "Ready to Ship";
        
        const awbRes = await generateAWB(srResponse.shipment_id);
        if (awbRes.awb_assign_status === 1) {
            order.awbCode = awbRes.response.data.awb_code;
            order.courierName = awbRes.response.data.courier_name;
            order.trackingUrl = `https://shiprocket.co/tracking/${awbRes.response.data.awb_code}`;
            order.status = "Shipped";
        }

        await order.save();
        revalidatePath('/admin/orders');
        return { success: true, message: "Order scheduled with courier!" };
    } else {
        const errorMsg = srResponse.message || "Shiprocket API Error";
        return { error: `Shipping Failed: ${errorMsg}` };
    }
  } catch (error) {
    return { error: `Internal Error: ${error.message}` };
  }
};

export const getLabelURL = async (orderId) => {
    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order?.shipmentId) return { error: "Shipment not found" };

    const res = await generateLabel(order.shipmentId);
    if (res.label_url) {
        return { success: true, url: res.label_url };
    }
    return { error: "Failed to generate label" };
}

export const cancelOrderShipment = async (orderId) => {
    await dbConnect();
    const order = await Order.findById(orderId);
    if(!order) return { error: "Order not found" };

    if (order.awbCode) {
        await cancelShipment(order.awbCode);
    }
    
    order.status = "Cancelled";
    await order.save();
    revalidatePath('/admin/orders');
    return { success: true, message: "Order cancelled successfully" };
}

// NEW: Sync Status from Shiprocket
export const syncOrderStatus = async (orderId) => {
    await dbConnect();
    const order = await Order.findById(orderId);
    if(!order || !order.awbCode) return { error: "Order or AWB not found" };

    const trackRes = await getTrackingStatus(order.awbCode);
    
    // Check if tracking data exists
    if (trackRes.tracking_data && trackRes.tracking_data.track_status && trackRes.tracking_data.track_status.length > 0) {
        const currentStatus = trackRes.tracking_data.track_status[0].status; // e.g., "NA", "PICKED UP", "DELIVERED"
        
        // Map Shiprocket Status to our DB Enum
        let newDbStatus = order.status;
        if (currentStatus === 'PICKED UP' || currentStatus === 'IN TRANSIT') newDbStatus = 'Shipped';
        if (currentStatus === 'DELIVERED') newDbStatus = 'Delivered';
        if (currentStatus === 'RTO INITIATED') newDbStatus = 'RTO';
        
        order.status = newDbStatus;
        await order.save();
        revalidatePath('/admin/orders');
        return { success: true, message: `Status updated to ${newDbStatus}` };
    }
    
    return { error: "No new tracking updates found." };
}