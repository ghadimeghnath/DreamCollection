"use client";

import { useState, useEffect } from "react";
import { X, Loader2, MapPin } from "lucide-react";
import { addAddress, updateAddress } from "@/features/user/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function CheckoutAddressModal({ isOpen, onClose, userId, addressToEdit = null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    phone: ""
  });

  // Populate form when addressToEdit changes
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        street: addressToEdit.street || "",
        city: addressToEdit.city || "",
        state: addressToEdit.state || "",
        zip: addressToEdit.zip || "",
        country: addressToEdit.country || "USA",
        phone: addressToEdit.phone || ""
      });
    } else {
      setFormData({ street: "", city: "", state: "", zip: "", country: "USA", phone: "" });
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      if (addressToEdit) {
        result = await updateAddress(userId, addressToEdit._id, formData);
      } else {
        result = await addAddress(userId, formData);
      }

      if (result.success) {
        addToast(addressToEdit ? "Address updated" : "Address added", "success");
        router.refresh(); 
        onClose();
      } else {
        addToast(result.error || "Failed to save address", "error");
      }
    } catch (error) {
      addToast("Something went wrong", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-600"/> 
            {addressToEdit ? "Edit Address" : "Add Delivery Address"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Street Address</label>
            <input 
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="123 Main St, Apt 4B"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">City</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">State</label>
              <input 
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">ZIP Code</label>
              <input 
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="10001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">Country</label>
              <input 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
            <input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (addressToEdit ? "Update Address" : "Save Address")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}