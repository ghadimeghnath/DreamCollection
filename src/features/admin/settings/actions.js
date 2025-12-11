"use server";

import dbConnect from '@/lib/db';
import StoreSettings from './models/StoreSettings';
import { revalidatePath } from 'next/cache';

export const getStoreSettings = async () => {
  await dbConnect();
  
  let settings = await StoreSettings.findOne().lean();
  
  if (!settings) {
    settings = await StoreSettings.create({});
    settings = await StoreSettings.findById(settings._id).lean();
  }

  // Convert Map to Object for client-side usage if needed, or keeping it as POJO
  // Mongoose maps in lean() return as standard objects usually, but let's be safe
  const serializedSettings = {
    ...settings,
    _id: settings._id.toString(),
    paymentConfigs: settings.paymentConfigs || {} 
  };

  return serializedSettings;
};

export const updatePaymentConfig = async (gatewayId, enabled, configData) => {
  await dbConnect();
  try {
    const updatePath = `paymentConfigs.${gatewayId}`;
    
    await StoreSettings.findOneAndUpdate({}, { 
        [updatePath]: {
            enabled,
            config: configData
        }
    }, { upsert: true });
    
    revalidatePath('/'); // Refresh checkout & admin
    return { success: true, message: `${gatewayId} settings updated` };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "Failed to update settings" };
  }
};