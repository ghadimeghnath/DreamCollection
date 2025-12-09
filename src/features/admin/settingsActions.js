"use server";

import dbConnect from '@/lib/db';
import Settings from './models/Settings';
import { revalidatePath } from 'next/cache';

export const getStoreSettings = async () => {
  await dbConnect();
  const settings = await Settings.findOne().lean();
  if (!settings) {
     // Create default if not exists
     return { upiId: "", whatsappNumber: "", isWhatsAppEnabled: false, instructions: "" };
  }
  return { ...settings, _id: settings._id.toString() };
};

export const updateStoreSettings = async (data) => {
  await dbConnect();
  try {
    // Upsert (Update if exists, insert if not)
    await Settings.findOneAndUpdate({}, data, { upsert: true, new: true });
    revalidatePath('/'); // Revalidate everywhere to reflect changes immediately
    return { success: true };
  } catch (error) {
    return { error: "Failed to save settings" };
  }
};