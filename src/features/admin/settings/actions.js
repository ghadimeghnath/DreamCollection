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

  // Ensure paymentGateways array exists
  if (!settings.paymentGateways) settings.paymentGateways = [];

  // SERIALIZATION FIX: Convert all ObjectIds and Dates to strings/numbers
  const serializedSettings = JSON.parse(JSON.stringify({
    ...settings,
    _id: settings._id.toString(),
    paymentGateways: settings.paymentGateways.map(gw => ({
        ...gw,
        _id: gw._id ? gw._id.toString() : undefined // Handle nested _id if it exists
    }))
  }));

  return serializedSettings;
};

export const updatePaymentGateway = async (gatewayId, enabled, configData) => {
  await dbConnect();
  try {
    const settings = await StoreSettings.findOne();
    
    if (!settings) {
        // Create initial if missing
        await StoreSettings.create({
            paymentGateways: [{ id: gatewayId, enabled, config: configData }]
        });
    } else {
        // Find existing gateway index
        const existingIndex = settings.paymentGateways.findIndex(g => g.id === gatewayId);
        
        if (existingIndex > -1) {
            // Update existing
            settings.paymentGateways[existingIndex].enabled = enabled;
            settings.paymentGateways[existingIndex].config = configData;
        } else {
            // Add new
            settings.paymentGateways.push({ id: gatewayId, enabled, config: configData });
        }
        await settings.save();
    }
    
    revalidatePath('/'); // Refresh app
    return { success: true, message: `${gatewayId} updated successfully` };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "Failed to update settings" };
  }
};