"use client";

import { useState } from "react";
import { updateStoreSettings } from "@/features/admin/settingsActions";
import { Loader2, Save, MessageCircle } from "lucide-react";

export default function SettingsForm({ initialSettings }) {
  const [formData, setFormData] = useState({
    upiId: initialSettings.upiId || "",
    whatsappNumber: initialSettings.whatsappNumber || "",
    isWhatsAppEnabled: initialSettings.isWhatsAppEnabled ?? false,
    instructions: initialSettings.instructions || ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateStoreSettings(formData);
    if (res.success) {
        alert("Settings saved successfully!");
    } else {
        alert("Failed to save settings.");
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-8">
        
        {/* Toggle Section */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex gap-4">
                <div className="p-2 bg-green-50 rounded-lg text-green-600 h-fit">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">Enable WhatsApp Orders</h3>
                    <p className="text-sm text-gray-500">Allow customers to checkout via WhatsApp.</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isWhatsAppEnabled" checked={formData.isWhatsAppEnabled} onChange={handleChange} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
        </div>

        {/* Inputs */}
        <div className="grid gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-medium">+</span>
                    <input 
                        type="text" 
                        name="whatsappNumber" 
                        value={formData.whatsappNumber} 
                        onChange={handleChange}
                        placeholder="919876543210"
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g. 91 for India).</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (VPA)</label>
                <input 
                    type="text" 
                    name="upiId" 
                    value={formData.upiId} 
                    onChange={handleChange}
                    placeholder="merchant@upi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Instructions</label>
                <textarea 
                    name="instructions" 
                    rows={3}
                    value={formData.instructions} 
                    onChange={handleChange}
                    placeholder="E.g. Please pay via UPI and share the screenshot to confirm your order."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm resize-none"
                />
            </div>
        </div>

        <div className="pt-4 flex justify-end">
            <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-indigo-700 transition disabled:opacity-70 shadow-sm"
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Settings
            </button>
        </div>
    </form>
  );
}