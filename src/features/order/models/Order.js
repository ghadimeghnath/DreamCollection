import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String },
      quantity: { type: Number, required: true },
      sku: { type: String } 
    }
  ],
  shippingAddress: {
     street: String,
     city: String,
     state: String,
     zip: String,
     country: String,
     phone: String 
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending' 
  },
  // Updated payment method enum
  paymentMethod: { type: String, default: 'COD' }, // 'COD', 'WhatsApp'
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  
  // New field for manual payment verification
  upiReference: { type: String }, 

}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);