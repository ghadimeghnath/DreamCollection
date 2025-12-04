"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, MapPin, Plus, Pencil } from "lucide-react";
import { addAddress, deleteAddress, updateAddress } from "../actions";

export default function AddressManager({ addresses, userId }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    street: "", city: "", state: "", zip: "", country: "USA"
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ street: "", city: "", state: "", zip: "", country: "USA" });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ street: "", city: "", state: "", zip: "", country: "USA" });
    setIsAdding(true);
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setFormData({
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country
    });
    setIsAdding(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    let res;

    if (editingId) {
      res = await updateAddress(userId, editingId, formData);
    } else {
      res = await addAddress(userId, formData);
    }

    if (res?.success) {
      resetForm();
    } else {
      alert(res.error || "Failed to save address");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        {/* Only show Add button if limit not reached AND not currently editing/adding */}
        {addresses.length < 2 && !isAdding && (
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-2">
            <Plus size={16} /> Add New
          </Button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSave} className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
            <h3 className="md:col-span-2 font-medium text-gray-900 mb-2">
                {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <Input 
                placeholder="Street Address" 
                value={formData.street} 
                onChange={e => setFormData({...formData, street: e.target.value})} 
                required 
                className="md:col-span-2"
            />
            <Input 
                placeholder="City" 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
                required 
            />
            <Input 
                placeholder="State" 
                value={formData.state} 
                onChange={e => setFormData({...formData, state: e.target.value})} 
                required 
            />
            <Input 
                placeholder="ZIP Code" 
                value={formData.zip} 
                onChange={e => setFormData({...formData, zip: e.target.value})} 
                required 
            />
            <Input 
                placeholder="Country" 
                value={formData.country} 
                onChange={e => setFormData({...formData, country: e.target.value})} 
                required 
            />
            <div className="md:col-span-2 flex gap-2 justify-end mt-2">
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
                <Button type="submit">{editingId ? "Update" : "Save"} Address</Button>
            </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div key={addr._id} className="border border-gray-200 rounded-lg p-5 flex justify-between items-start bg-white shadow-sm hover:shadow-md transition">
            <div className="flex gap-3">
               <div className="bg-indigo-50 p-2 rounded-full h-fit text-indigo-600">
                  <MapPin size={20} />
               </div>
               <div>
                  <p className="font-medium text-gray-900">{addr.street}</p>
                  <p className="text-gray-500 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                  <p className="text-gray-500 text-sm">{addr.country}</p>
               </div>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => handleEdit(addr)}
                    className="text-gray-400 hover:text-indigo-600 transition p-2 rounded-full hover:bg-gray-100"
                    title="Edit Address"
                >
                    <Pencil size={16} />
                </button>
                <button 
                    onClick={async () => await deleteAddress(addr._id)}
                    className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-gray-100"
                    title="Delete Address"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && !isAdding && (
            <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                No addresses saved yet.
            </div>
        )}
      </div>
    </div>
  );
}