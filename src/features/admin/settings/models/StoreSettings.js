import mongoose from 'mongoose';

const StoreSettingsSchema = new mongoose.Schema({
  // Dynamic Payment Configs: Key = Gateway ID (e.g. 'whatsapp'), Value = Config Object
  paymentConfigs: {
    type: Map,
    of: new mongoose.Schema({
      enabled: { type: Boolean, default: false },
      config: { type: mongoose.Schema.Types.Mixed, default: {} } // Stores dynamic fields
    }, { _id: false }),
    default: {}
  },

  // Branding (Standard fields)
  branding: {
    storeName: { type: String, default: 'Dream Collection' },
    currency: { type: String, default: 'USD' },
    logoUrl: { type: String }
  },

  // Shipping (Standard fields)
  shipping: {
    freeShippingThreshold: { type: Number, default: 0 },
    standardRate: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.StoreSettings || mongoose.model('StoreSettings', StoreSettingsSchema);