import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 
  image: { type: String },
  phone: { type: String },
  isAdmin: { type: Boolean, default: false },
  provider: { type: String, default: "credentials" },
  
  // --- Verification & Security ---
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpire: { type: Date },

  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model("User", userSchema);