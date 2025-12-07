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
    // FIX: Added 'Ready to Ship' and 'RTO' to the allowed values
    enum: ['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled', 'RTO'],
    default: 'Pending' 
  },
  paymentMethod: { type: String, default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  
  // --- Logistics Fields (Shiprocket) ---
  shiprocketOrderId: { type: String },
  shipmentId: { type: String },
  awbCode: { type: String },
  courierName: { type: String },
  trackingUrl: { type: String },
  
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);