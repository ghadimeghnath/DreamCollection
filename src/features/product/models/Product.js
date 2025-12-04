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
    required: true, // e.g., "Muscle", "JDM", "Exotic"
  },
  series: { 
    type: String, 
    required: true,
    index: true 
  }, 
  year: { 
    type: Number, 
    required: true,
    min: [1968, 'Year must be 1968 or later'], 
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
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
    type: Number, // Optional: for showing the "crossed out" MRP
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String, // Stored as a paragraph, we will split it by newlines in UI
    required: false
  }
}, { timestamps: true });

ProductSchema.index({ series: 1, year: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);