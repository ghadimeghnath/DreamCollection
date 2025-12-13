import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema({
  // Dynamic Payment Configs: stored as an array of objects
  paymentGateways: [
    {
      id: { type: String, required: true }, // e.g. 'whatsapp', 'cod'
      enabled: { type: Boolean, default: false },
      config: { type: mongoose.Schema.Types.Mixed, default: {} } // Flexible config storage
    }
  ],

  // Branding (Standard fields)
  branding: {
    storeName: { type: String, default: 'Dream Collection' },
    currency: { type: String, default: 'USD' },
    logoUrl: { type: String }
  },

  // Shipping
  shipping: {
    freeShippingThreshold: { type: Number, default: 0 },
    standardRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);