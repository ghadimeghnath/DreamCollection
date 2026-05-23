"use server";

import dbConnect from '@/lib/db';
import StoreSettings from './models/StoreSettings';
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
// Add the 'mask = true' parameter here
export const getStoreSettings = async (mask = true) => {
  await dbConnect();
  
  let settings = await StoreSettings.findOne().lean();
  
  if (!settings) {
    settings = await StoreSettings.create({});
    settings = await StoreSettings.findById(settings._id).lean();
  }

  if (!settings.paymentGateways) settings.paymentGateways = [];

  const safePaymentGateways = settings.paymentGateways.map(gw => {
    const safeConfig = { ...(gw.config || {}) };
    
    // ✅ ONLY mask if 'mask' is true
    if (mask) {
      const sensitiveKeys = ['secretKey', 'accessKey', 'password', 'webhookSecret'];
      sensitiveKeys.forEach(key => {
        if (safeConfig[key]) safeConfig[key] = "********";
      });
    }

    return { ...gw, config: safeConfig };
  });

  const serializedSettings = JSON.parse(JSON.stringify({
    ...settings,
    _id: settings._id.toString(),
    paymentGateways: safePaymentGateways.map(gw => ({
        ...gw,
        _id: gw._id ? gw._id.toString() : undefined 
    }))
  }));

  return serializedSettings;
};

export const updatePaymentGateway = async (gatewayId, enabled, configData) => {
  await dbConnect();
  try {
    await requireAdmin(); // PROTECTED

    const settings = await StoreSettings.findOne();
    
    if (!settings) {
        await StoreSettings.create({
            paymentGateways: [{ id: gatewayId, enabled, config: configData }]
        });
    } else {
        const existingIndex = settings.paymentGateways.findIndex(g => g.id === gatewayId);
        
        if (existingIndex > -1) {
            // SECURITY: Handle masking on save. 
            // If the incoming configData has "********", we must preserve the OLD key.
            const oldConfig = settings.paymentGateways[existingIndex].config || {};
            const newConfig = { ...configData };

            ['secretKey', 'accessKey', 'password', 'webhookSecret'].forEach(key => {
                if (newConfig[key] === "********") {
                    newConfig[key] = oldConfig[key]; // Restore the real key from DB
                }
            });

            settings.paymentGateways[existingIndex].enabled = enabled;
            settings.paymentGateways[existingIndex].config = newConfig;
        } else {
            settings.paymentGateways.push({ id: gatewayId, enabled, config: configData });
        }
        await settings.save();
    }
    
    revalidatePath('/checkout'); 
    revalidatePath('/admin/settings');
    revalidatePath('/'); 
    return { success: true, message: `${gatewayId} updated successfully` };
  } catch (error) {
    console.error("Update Error:", error);
    return { error: "Failed to update settings" };
  }
};