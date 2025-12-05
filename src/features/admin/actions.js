"use server";

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import Order from '@/features/order/models/Order';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Helper: Upload Image ---
export async function uploadImage(formData) {
  const file = formData.get('file');
  if (!file) return { error: "No file provided" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload via Promise
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "hotwheels-store" }, 
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return { success: true, url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return { error: "Image upload failed" };
  }
}

// --- Product Actions ---

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
  } catch (error) {
    console.error("Add Product Error:", error);
    return { error: error.message || "Failed to add product" };
  }
};

export const updateProduct = async (id, productData) => {
    await dbConnect();
    try {
        // If name changed, we might want to update slug, but usually better to keep slug stable for SEO
        // If you want to allow slug updates, handle it here.
        
        await Product.findByIdAndUpdate(id, productData);
        revalidatePath('/admin');
        revalidatePath(`/products/${productData.slug}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update product" };
    }
}

export const deleteProduct = async (productId) => {
  await dbConnect();
  try {
    await Product.findByIdAndDelete(productId);
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete product" };
  }
};

// --- Order Actions (Keep existing) ---
export const getAllOrders = async () => {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return orders.map(order => ({
    ...order,
    _id: order._id.toString(),
    userId: order.userId.toString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(item => ({...item, _id: item._id?.toString() }))
  }));
};

export const updateOrderStatus = async (orderId, newStatus) => {
  await dbConnect();
  await Order.findByIdAndUpdate(orderId, { status: newStatus });
  revalidatePath('/admin/orders');
  return { success: true };
};