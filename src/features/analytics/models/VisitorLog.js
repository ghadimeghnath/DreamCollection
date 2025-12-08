import mongoose from 'mongoose';

const VisitorLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  page: { type: String }, // Optional: Track which page was visited
  // We don't store IPs to respect basic privacy/GDPR, but you could hash session IDs here
}, { timestamps: false }); // Disable default timestamps as we have our own indexed timestamp

// Index for fast date-range queries
VisitorLogSchema.index({ timestamp: 1 });

export default mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);