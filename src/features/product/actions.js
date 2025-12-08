'use server'

import dbConnect from '@/lib/db';
import Product from '@/features/product/models/Product';
import { revalidatePath } from 'next/cache';

// Fetch products with Search, Filter & Pagination
export async function getProducts({ query = '', category = '', page = 1, limit = 10 } = {}) {
  await dbConnect();

  try {
    const skip = (page - 1) * limit;

    // Build Query Object
    const filter = {};
    
    // Search by Name or Description (Case Insensitive)
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by Category
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Parallel Fetch: Data + Count
    const [products, totalItems] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);
  
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return {
      products: serializedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      }
    };

  } catch (error) {
    console.error("Fetch Products Error:", error);
    // Return empty structure on error to prevent page crash
    return { products: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0 } };
  }
}

// Fetch products by Category (Public View)
export async function getProductsByCategory(category) {
  await dbConnect();
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

export async function toggleStock(id, currentStatus) {
  await dbConnect();
  await Product.findByIdAndUpdate(id, { inStock: !currentStatus });
  revalidatePath('/'); 
  revalidatePath('/admin');
}