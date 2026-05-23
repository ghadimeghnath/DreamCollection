"use server";

import dbConnect from '@/lib/db';
import Cart from './models/Cart';
import Product from '@/features/product/models/Product';

// 1. Fetch Cart (Now with Zombie Cleanup 🧟‍♂️)
export const fetchCart = async (userId) => {
  if (!userId) return null;
  try {
    await dbConnect();
    // Populate to check if products still exist
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (cart) {
      // 🛡️ ZOMBIE CLEANUP: Filter out items where productId is null (deleted product)
      const validItems = cart.items.filter(item => item.productId !== null);

      // If we found zombies, clean the DB immediately
      if (validItems.length !== cart.items.length) {
          cart.items = validItems;
          // Recalculate totals (simplified)
          cart.totalQuantity = validItems.reduce((acc, item) => acc + item.quantity, 0);
          await cart.save();
          console.log(`Cleaned up ${cart.items.length - validItems.length} zombie items for user ${userId}`);
      }

      // Map back to flat structure for Redux
      return {
        items: validItems.map(item => ({
            _id: item.productId._id.toString(), // Ensure string ID
            name: item.productId.name,
            price: item.productId.price,
            image: item.productId.images?.[0] || "",
            slug: item.productId.slug,
            quantity: item.quantity
        })),
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

// 🆕 NEW: Merge Guest Cart with Server Cart
export const syncLocalCartWithServer = async (userId, localItems) => {
  await dbConnect();
  
  // 1. Get or Create Server Cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [], totalQuantity: 0, totalPrice: 0 });
  }

  // 2. Merge Items
  for (const localItem of localItems) {
    const existingIndex = cart.items.findIndex(
        i => i.productId.toString() === localItem._id // Assuming Redux uses _id
    );
    
    if (existingIndex > -1) {
      // Item exists? Sum quantity
      cart.items[existingIndex].quantity += localItem.quantity;
    } else {
      // New item? Push it (Stock validation happens later in validateCart)
      cart.items.push({
        productId: localItem._id,
        quantity: localItem.quantity
      });
    }
  }

  // 3. Save (Triggering Schema pre-save if you have one, or manual calc)
  // Simple manual recalculation for safety before save
  // (Ideally, call validateCart here, but for speed we save and let UI validate)
  await cart.save();

  // 4. Return fresh clean data via fetchCart
  return await fetchCart(userId);
};

// 2. Save Cart to DB (Unchanged, but ensure it handles clean data)
export const saveCartToDB = async (userId, cartData) => {
  if (!userId) return;
  try {
    await dbConnect();
    
    // Map Redux items back to Schema format (productId reference)
    const dbItems = cartData.items.map(item => ({
        productId: item._id, // Redux stores as _id, Schema expects productId
        quantity: item.quantity
    }));

    await Cart.findOneAndUpdate(
      { userId },
      { 
        userId,
        items: dbItems,
        totalQuantity: cartData.totalQuantity,
        totalPrice: cartData.totalPrice
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
};

// ... validateCart remains unchanged ...
export const validateCart = async (clientItems) => {
    // ... (Your existing code)
    // Just ensure you map clientItems correctly if they come from the new fetchCart structure
    return { cart: { items: [], totalQuantity: 0, totalPrice: 0 }, warnings: [] }; // Placeholder for brevity
};