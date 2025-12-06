'use server'

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import { revalidatePath } from 'next/cache';

// Fetch all products
export async function getProducts() {
  await dbConnect();
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  
  return products.map(product => ({
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

// Fetch products by Category
export async function getProductsByCategory(category) {
  await dbConnect();
  // Decode URL (e.g. "Muscle%20Cars" -> "Muscle Cars")
  const decodedCategory = decodeURIComponent(category);
  
  const products = await Product.find({ category: decodedCategory }).sort({ createdAt: -1 }).lean();
  
  return products.map(product => ({
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
  }));
}

// Fetch single product by Slug
export const getProductBySlug = async (slug) => {
  try {
    await dbConnect();
    const decodedSlug = decodeURIComponent(slug);
    
    // Check both slug and name for backward compatibility
    const product = await Product.findOne({ 
      $or: [{ slug: decodedSlug }, { name: decodedSlug }] 
    }).lean();
    
    if (!product) return null;

    return {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

// Toggle Stock (Admin Function)
export async function toggleStock(id, currentStatus) {
  await dbConnect();
  await Product.findByIdAndUpdate(id, { inStock: !currentStatus });
  revalidatePath('/'); 
  revalidatePath('/admin');
}