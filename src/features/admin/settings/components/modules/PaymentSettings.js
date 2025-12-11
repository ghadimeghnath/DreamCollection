"use client";

import { useState } from "react";
import { updatePaymentConfig } from "../../actions";
import { useToast } from "@/context/ToastContext";
import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { PAYMENT_GATEWAYS } from "@/features/admin/settings/modules/payments/paymentRegistry";

export default function PaymentSettings({ settings }) {
  const { addToast } = useToast();
  
  return (
    <div className="space-y-6">
       {PAYMENT_GATEWAYS.map((gateway) => {
         const currentConfig = settings?.paymentConfigs?.[gateway.id] || {};
         
         return (
           <PaymentGatewayCard 
              key={gateway.id}
              gateway={gateway}
              currentConfig={currentConfig}
              onSave={async (enabled, data) => {
                  const res = await updatePaymentConfig(gateway.id, enabled, data);
                  if(res.success) addToast(`${gateway.label} settings saved`, "success");
                  else addToast(res.error, "error");
              }}
           />
         );
       })}
    </div>
  );
}

function PaymentGatewayCard({ gateway, currentConfig, onSave }) {
    const [enabled, setEnabled] = useState(currentConfig.enabled ?? false);
    const [isExpanded, setIsExpanded] = useState(false); // Collapsible
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        await onSave(enabled, data);
        setIsSaving(false);
    };

    return (
        <div className={`bg-white rounded-xl border transition-all duration-200 ${enabled ? 'border-indigo-200 shadow-sm' : 'border-gray-200 opacity-80 hover:opacity-100'}`}>
            <div className="p-6 flex items-start justify-between">
                <div className="flex gap-4 cursor-pointer flex-1" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className={`p-3 rounded-lg h-fit ${enabled ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                        {gateway.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {gateway.label}
                            {enabled && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">Active</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">{gateway.description}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {/* Master Toggle */}
                    <button 
                        type="button"
                        onClick={() => setEnabled(!enabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Dynamic Configuration Form */}
            {(isExpanded || enabled) && (
                <form onSubmit={handleSubmit} className="border-t border-gray-100 p-6 bg-gray-50/50 rounded-b-xl animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {gateway.fields.map(field => (
                            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea 
                                        name={field.name}
                                        defaultValue={currentConfig.config?.[field.name]}
                                        rows={field.rows || 3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                                        required={field.required}
                                    />
                                ) : (
                                    <input 
                                        type={field.type}
                                        name={field.name}
                                        defaultValue={currentConfig.config?.[field.name] || field.defaultValue}
                                        placeholder={field.placeholder}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition px-6 py-2.5 rounded-lg shadow-sm"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save Configuration
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}