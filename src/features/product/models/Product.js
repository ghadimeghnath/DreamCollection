import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide a product name'], 
    trim: true, 
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
  },
  series: { 
    type: String, 
    required: true,
    index: true 
  }, 
  year: { 
    type: Number, 
    required: true,
  },
  images: [{ 
    type: String, 
    required: true 
  }],
  // --- Pricing & Profitability Fields ---
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'] 
  },
  originalPrice: {
    type: Number, 
  },
  costPrice: {
    type: Number,
    default: 0,
    select: false // Security: Usually don't want to expose cost price to public API
  },
  taxRate: {
    type: Number,
    default: 0 // Percentage (e.g., 18 for 18% GST)
  },
  // --- Shipping Calculation Fields ---
  weight: {
    type: Number, // In Grams or Kg depending on your standard
    default: 0,
    min:[0, "Weight cannot be in negeative"]
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'heavy', 'express'],
    default: 'standard'
  },
  // --- Inventory ---
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String,
    required: false
  },
  // --- SEO Fields ---
  seoTitle: { type: String, trim: true },
  seoDescription: { type: String, trim: true },
  seoKeywords: { type: String, trim: true },
  
}, { timestamps: true });

ProductSchema.index({ series: 1, year: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);