import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional because Google users won't have one
  image: { type: String },
  isAdmin: { type: Boolean, default: false },
  provider: { type: String, default: "credentials" }, // 'google' or 'credentials'
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model("User", userSchema);