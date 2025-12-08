"use server";

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import Order from '@/features/order/models/Order';
import { User } from '@/features/auth/models/User';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Analytics Actions ---
export const getDashboardStats = async () => {
  await dbConnect();

  try {
    const [totalOrders, totalUsers, activeProducts, revenueResult] = await Promise.all([
      // 1. Total Orders
      Order.countDocuments(),
      
      // 2. Active Users (excluding admins)
      User.countDocuments({ isAdmin: false }),
      
      // 3. Products In Stock
      Product.countDocuments({ inStock: true }),
      
      // 4. Total Revenue (Sum of non-cancelled orders)
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    return {
      totalOrders,
      totalUsers,
      activeProducts,
      totalRevenue
    };
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return { totalOrders: 0, totalUsers: 0, activeProducts: 0, totalRevenue: 0 };
  }
};

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
export const getAllOrders = async ({ page = 1, limit = 10, status = '' } = {}) => {
  await dbConnect();

  try {
    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, totalItems] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email') 
        .lean(),
      Order.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const serializedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId ? {
        _id: order.userId._id.toString(),
        name: order.userId.name,
        email: order.userId.email,
      } : { name: 'Unknown User', email: 'N/A' },
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
      items: order.items.map(item => ({...item, _id: item._id?.toString() }))
    }));

    return {
      orders: serializedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { orders: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  await dbConnect();
  await Order.findByIdAndUpdate(orderId, { status: newStatus });
  revalidatePath('/admin/orders');
  return { success: true };
};