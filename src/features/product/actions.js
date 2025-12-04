'use server'

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import { revalidatePath } from 'next/cache';

// Fetch all products (Optimized for Public View)
export async function getProducts() {
  await dbConnect();
  // Lean queries are faster as they return POJOs (Plain Old JS Objects)
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  
  // Convert _id and dates to string for serialization
  return products.map(product => ({
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
}

// Fetch single product by Slug
export const getProductBySlug = async (slug) => {
  try {
    await dbConnect();

    // FIX: Decode the slug to handle URL encoding
    // This turns "1969%20Chevy%20Camaro%20SS" back into "1969 Chevy Camaro SS"
    const decodedSlug = decodeURIComponent(slug);

    const product = await Product.findOne({ name: decodedSlug }).lean();
    
    if (!product) return null;

    // Serialize MongoDB object
    return {
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
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