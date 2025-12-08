"use client";

import { useState } from "react";
import AddressManager from "./AddressManager";
import OrderHistory from "./OrderHistory";
import AccountSettings from "./AccountSettings"; // Import new component
import { User, Package, MapPin, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

export default function UserProfile({ user, addresses, orders }) {
  const [activeTab, setActiveTab] = useState("orders");

  const menuItems = [
    { id: "orders", label: "My Orders", icon: <Package size={20} /> },
    { id: "addresses", label: "Addresses", icon: <MapPin size={20} /> },
    { id: "settings", label: "Account Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
       
       {/* Sidebar */}
       <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
             <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0">
                {user.image ? (
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <User size={24} />
                    </div>
                )}
             </div>
             <div className="overflow-hidden">
                <h2 className="font-bold text-gray-900 truncate">{user.name}</h2>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
             </div>
          </div>

          <nav className="space-y-1">
             {menuItems.map((item) => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}
                 >
                    {item.icon} {item.label}
                 </button>
             ))}
             
             <hr className="my-2 border-gray-100" />
             
             <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition"
             >
                <LogOut size={20} /> Logout
             </button>
          </nav>
       </aside>

       {/* Main Content */}
       <main className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 min-h-[500px]">
           {activeTab === 'orders' && <OrderHistory orders={orders} />}
           {activeTab === 'addresses' && <AddressManager addresses={addresses} userId={user.id} />}
           {activeTab === 'settings' && <AccountSettings user={user} />}
       </main>
    </div>
  );
}