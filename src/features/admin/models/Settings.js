import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  upiId: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' }, // e.g., "919876543210"
  isWhatsAppEnabled: { type: Boolean, default: true },
  instructions: { type: String, default: "Please pay via UPI and share the screenshot." }
}, { timestamps: true });

// Singleton pattern: We typically only need one settings document
export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);