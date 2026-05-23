"use server";

import dbConnect from '@/lib/db';
import Settings from './models/Settings';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.config";

// Helper for Admin Authorization
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error("Unauthorized: Admin access required");
  }
}

export const getStoreSettings = async () => {
  await dbConnect();
  const settings = await Settings.findOne().lean();
  if (!settings) {
     return { upiId: "", whatsappNumber: "", isWhatsAppEnabled: false, instructions: "" };
  }
  return { ...settings, _id: settings._id.toString() };
};

export const updateStoreSettings = async (data) => {
  await dbConnect();
  try {
    await requireAdmin(); // PROTECTED

    await Settings.findOneAndUpdate({}, data, { upsert: true, new: true });
    revalidatePath('/'); 
    return { success: true };
  } catch (error) {
    return { error: "Failed to save settings: " + error.message };
  }
};