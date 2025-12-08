"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserProfile } from "../actions";
import { useToast } from "@/context/ToastContext";
import { User, Phone, Mail, Loader2 } from "lucide-react";

export default function AccountSettings({ user }) {
  const { addToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    // Email is read-only for now
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await updateUserProfile(user.id, formData);

    if (res.success) {
        addToast("Profile updated successfully", "success");
    } else {
        addToast(res.error || "Failed to update profile", "error");
    }
    
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl">
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500">Manage your personal details and contact info.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User size={16} /> Full Name
                </label>
                <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone size={16} /> Phone Number
                </label>
                <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234 567 890"
                    type="tel"
                />
            </div>

            <div className="space-y-2 opacity-60 cursor-not-allowed">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail size={16} /> Email Address
                </label>
                <Input 
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                />
                <p className="text-xs text-gray-400">Email address cannot be changed directly.</p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    </div>
  );
}