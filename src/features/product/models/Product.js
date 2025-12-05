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
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative'] 
  },
  originalPrice: {
    type: Number, 
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
  seoKeywords: { type: String, trim: true }, // Comma separated strings
  
}, { timestamps: true });

ProductSchema.index({ series: 1, year: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);