"use client";

import { useState } from "react";
import { CreditCard, Truck, Palette, Bell, Shield, Wallet } from "lucide-react";
import PaymentSettings from "./modules/PaymentSettings";

export default function SettingsLayout({ initialSettings }) {
  const [activeTab, setActiveTab] = useState("payments");

  // Navigation Items
  const tabs = [
    { id: "payments", label: "Payments", icon: <CreditCard size={18} /> },
    { id: "Cost Management", label: "Cost Management", icon: <Truck size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
       
       {/* 1. Navigation Sidebar */}
       <nav className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
             {tabs.map((tab) => (
                <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`
                      w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-l-4
                      ${activeTab === tab.id 
                         ? 'bg-indigo-50 text-indigo-700 border-indigo-600' 
                         : 'text-gray-600 hover:bg-gray-50 border-transparent'
                      }
                   `}
                >
                   {tab.icon} {tab.label}
                </button>
             ))}
          </div>
       </nav>

       {/* 2. Main Content Area */}
       <div className="flex-1 min-h-[400px]">
          {activeTab === 'payments' && <PaymentSettings settings={initialSettings.payments} />}
       </div>
    </div>
  );
}