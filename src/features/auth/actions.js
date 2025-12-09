"use server";

import dbConnect from "@/lib/db";
import { User } from "./models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/mail";

// --- Registration ---
export const registerUser = async (formData) => {
  const { name, email, password } = formData;

  try {
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (existingUser) return { error: "User already exists!" };

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; 

    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpire
    });

    await newUser.save();
    await sendVerificationEmail(email, verificationToken);

    return { success: true, message: "Confirmation email sent!" };

  } catch (err) {
    console.error("Registration Error:", err);
    return { error: "Something went wrong!" };
  }
};

// --- Resend Verification Email ---
export const resendVerificationEmail = async (email) => {
  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) return { error: "User not found." };
    if (user.isVerified) return { error: "Email is already verified. Please login." };

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
    
    await user.save();
    await sendVerificationEmail(email, verificationToken);

    return { success: true, message: "Verification email resent!" };
  } catch (err) {
    console.error("Resend Error:", err);
    return { error: "Failed to resend email." };
  }
};

// --- Verify Email ---
export const verifyEmail = async (token) => {
    await dbConnect();
    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpire: { $gt: Date.now() }
    });

    if (!user) return { error: "Invalid or expired token" };

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    await user.save();

    return { success: true, message: "Email verified successfully!" };
};

// --- Password Reset Request ---
export const requestPasswordReset = async (email) => {
  await dbConnect();
  try {
    const user = await User.findOne({ email, provider: "credentials" });
    if (!user) return { success: true, message: "If an account exists, a reset link has been sent." };

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
    return { success: true, message: "Reset link sent to your email!" };

  } catch (error) {
    return { error: "Failed to process request" };
  }
};

// --- Reset Password ---
export const resetPassword = async (token, newPassword) => {
  await dbConnect();
  try {
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return { error: "Invalid or expired token" };

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return { success: true };

  } catch (error) {
    return { error: "Failed to reset password" };
  }
};