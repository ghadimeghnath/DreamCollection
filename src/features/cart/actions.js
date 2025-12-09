"use server";

import dbConnect from '@/lib/db';
import Cart from './models/Cart';
import Product from '@/features/product/models/Product';

// 1. Fetch Cart
export const fetchCart = async (userId) => {
  if (!userId) return null;
  try {
    await dbConnect();
    const cart = await Cart.findOne({ userId }).lean();
    if (cart) {
      return {
        items: cart.items,
        totalQuantity: cart.totalQuantity,
        totalPrice: cart.totalPrice
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return null;
  }
};

// 2. Save Cart
export const saveCartToDB = async (userId, cartData) => {
  if (!userId) return;
  try {
    await dbConnect();
    await Cart.findOneAndUpdate(
      { userId },
      { 
        userId,
        items: cartData.items,
        totalQuantity: cartData.totalQuantity,
        totalPrice: cartData.totalPrice
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

// 3. Validate Cart (Validation Guard)
export const validateCart = async (clientItems) => {
  await dbConnect();
  
  // FIX: Gracefully handle empty/null inputs
  if (!clientItems || !Array.isArray(clientItems) || clientItems.length === 0) {
    return {
        cart: { items: [], totalQuantity: 0, totalPrice: 0 },
        warnings: []
    };
  }

  const validatedItems = [];
  let totalQuantity = 0;
  let totalPrice = 0;
  const warnings = [];

  for (const item of clientItems) {
    // 1. Fetch latest product data
    const product = await Product.findById(item._id).lean();

    // Case A: Product Deleted or Hidden
    if (!product) {
      warnings.push(`"${item.name}" is no longer available and was removed.`);
      continue;
    }

    // Case B: Out of Stock
    if (!product.inStock) {
      warnings.push(`"${product.name}" is currently out of stock.`);
      continue;
    }

    // Case C: Price Changed
    if (product.price !== item.price) {
      warnings.push(`Price for "${product.name}" updated from $${item.price} to $${product.price}.`);
    }

    // Add to valid list with SERVER-SIDE price
    validatedItems.push({
      _id: product._id.toString(),
      name: product.name,
      price: product.price, // Trust server price ONLY
      image: product.images?.[0] || "",
      slug: product.slug,
      quantity: item.quantity,
      series: product.series,
      year: product.year
    });

    totalQuantity += item.quantity;
    totalPrice += product.price * item.quantity;
  }

  return {
    cart: {
      items: validatedItems,
      totalQuantity,
      totalPrice
    },
    warnings
  };
};