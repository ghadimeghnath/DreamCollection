"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, setCart, removeFromCart } from "@/features/cart/cartSlice"; 
import { createOrder } from "@/features/order/actions";
import { validateCart } from "@/features/cart/actions";
import { getStoreSettings } from "@/features/admin/settings/actions"; // Updated Import
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Plus, Loader2, ShieldCheck, AlertCircle, Pencil, Trash2 } from "lucide-react"; 
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import CheckoutAddressModal from "./CheckoutAddressModal";
import { PAYMENT_GATEWAYS } from "@/features/admin/settings/modules/payments/paymentRegistry"; // Registry Import

export default function Checkout({ userId, savedAddresses = [] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const cartState = useAppSelector((state) => state.cart || {});
  const items = Array.isArray(cartState?.items) ? cartState.items : [];
  const totalPrice = cartState?.totalPrice || 0;
  const safeAddresses = Array.isArray(savedAddresses) ? savedAddresses : [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(""); // Dynamic default
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null); 
  
  const [storeSettings, setStoreSettings] = useState(null);
  const [activeGateways, setActiveGateways] = useState([]);

  useEffect(() => {
    setIsMounted(true);
    // Fetch settings and filter active gateways
    getStoreSettings().then(settings => {
        setStoreSettings(settings);
        
        // Filter registry based on what's enabled in DB
        const enabled = PAYMENT_GATEWAYS.filter(g => settings.paymentConfigs?.[g.id]?.enabled);
        setActiveGateways(enabled);
        
        // Set default payment method to first available
        if (enabled.length > 0) setPaymentMethod(enabled[0].id);
    });
  }, []);

  // ... (Keep existing Cart Validation useEffect & Empty State checks) ...
  // [Copy the validation useEffect and empty state checks from previous version here]
  useEffect(() => {
    const verifyStock = async () => {
        if (items.length === 0) { setIsVerifying(false); return; }
        try {
            const result = await validateCart(items);
            if (result?.warnings?.length > 0) {
                result.warnings.forEach(w => addToast(w, "error"));
                if (result.cart) dispatch(setCart(result.cart)); 
                if (result.cart?.items?.length !== items.length) { router.push('/cart'); }
            }
        } catch (error) { console.error("Validation error:", error); } 
        finally { setIsVerifying(false); }
    };
    verifyStock();
  }, [isMounted]);

  if (!isMounted || (isVerifying && items.length > 0)) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" /><p className="text-gray-500 font-medium">Loading checkout...</p></div>;
  }
  if (items.length === 0) {
     return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"><div className="bg-gray-100 p-4 rounded-full mb-4"><AlertCircle className="h-8 w-8 text-gray-400" /></div><h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2><Link href="/"><button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium">Return to Shop</button></Link></div>
  }


  const handlePlaceOrder = async () => {
    if (safeAddresses.length === 0) {
        addToast("Please add a shipping address first.", "warning");
        return;
    }

    if (!paymentMethod) {
        addToast("Please select a payment method.", "warning");
        return;
    }

    setIsProcessing(true);
    
    // Server Validation
    try {
        const validation = await validateCart(items);
        if (validation?.warnings?.length > 0) {
            validation.warnings.forEach(w => addToast(w, "error"));
            dispatch(setCart(validation.cart));
            setIsProcessing(false);
            return; 
        }
    } catch { setIsProcessing(false); return; }

    const addressToUse = safeAddresses[selectedAddressIndex];
    
    // Create Order
    const result = await createOrder(userId, {
        shippingAddress: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            zip: addressToUse.zip,
            country: addressToUse.country,
            phone: addressToUse.phone 
        },
        paymentMethod: paymentMethod // Store the ID (e.g., 'whatsapp', 'cod')
    });

    if (result.success) {
        dispatch(clearCart());
        
        // --- Dynamic Payment Handling ---
        const gateway = PAYMENT_GATEWAYS.find(g => g.id === paymentMethod);
        const config = storeSettings.paymentConfigs?.[paymentMethod]?.config || {};

        if (gateway?.id === 'whatsapp') {
            // WhatsApp Specific Logic
            const orderId = result.orderId.slice(-6).toUpperCase();
            const total = (totalPrice * 1.02).toFixed(2);
            
            const message = `*New Order: #${orderId}*
---------------------------
*Total:* ₹${total}
*Pay to:* ${config.upiId}

*Address:*
${addressToUse.street}, ${addressToUse.city}
${addressToUse.zip}

*Items:*
${items.map(i => `• ${i.name} (x${i.quantity})`).join('\n')}
---------------------------
${config.instructions}`;

            const waLink = `https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`;
            window.location.href = waLink;

        } else if (gateway?.id === 'stripe') {
            // Future Stripe Logic
            addToast("Redirecting to Stripe...", "success");
        } else {
            // Default (COD)
            addToast("Order placed successfully!", "success");
            router.push(`/profile?success=true`);
        }
    } else {
        addToast(result.error || "Failed to place order", "error");
        setIsProcessing(false);
    }
  };

  const openAddModal = () => { setAddressToEdit(null); setIsAddressModalOpen(true); };
  const openEditModal = (e, addr) => { e.stopPropagation(); setAddressToEdit(addr); setIsAddressModalOpen(true); };
  const tax = totalPrice * 0.02;
  const finalTotal = totalPrice + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
      
      {/* LEFT COLUMN */}
      <div className="flex-1 space-y-6">
        
        {/* Step 1: Address (Kept as is) */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Shipping Address
                </h2>
                <button onClick={openAddModal} className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"><Plus size={16} /> New Address</button>
            </div>
            {safeAddresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {safeAddresses.map((addr, idx) => (
                        <div key={addr._id} onClick={() => setSelectedAddressIndex(idx)} className={`cursor-pointer border rounded-lg p-4 relative transition-all group ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}>
                            {selectedAddressIndex === idx && <div className="absolute top-3 right-3 text-indigo-600"><CheckCircle size={20} fill="currentColor" className="text-white" /></div>}
                            <button onClick={(e) => openEditModal(e, addr)} className={`absolute top-3 right-3 text-gray-400 hover:text-indigo-600 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 transition-opacity ${selectedAddressIndex === idx ? 'right-10' : 'right-3'} opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}><Pencil size={16} /></button>
                            <p className="font-medium text-gray-900 mb-1 pr-8">{addr.street}</p>
                            <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-gray-500">{addr.country}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300"><p className="text-gray-500 mb-3 text-sm">No delivery addresses found.</p><button onClick={openAddModal} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"><Plus size={16} className="inline mr-1" /> Add Address</button></div>
            )}
        </div>

        {/* Step 2: Payment (Dynamic) */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Payment Method
            </h2>
            
            <div className="space-y-3">
                {activeGateways.length > 0 ? (
                    activeGateways.map((gateway) => (
                        <label 
                            key={gateway.id}
                            className={`
                                flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                                ${paymentMethod === gateway.id ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            <input 
                                type="radio" 
                                name="payment" 
                                value={gateway.id} 
                                checked={paymentMethod === gateway.id}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 shrink-0"
                            />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                        {gateway.icon} {gateway.label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{gateway.description}</p>
                            </div>
                        </label>
                    ))
                ) : (
                    <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                        No payment methods are currently enabled. Please contact support.
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Summary (Kept as is, just cleaner structure) */}
      <div className="lg:w-96 shrink-0 w-full">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1 scrollbar-thin">
                  {items.map(item => (
                      <div key={item._id} className="flex gap-3 text-sm group relative">
                          <div className="w-16 h-16 bg-white rounded-md border border-gray-200 overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} /></div>
                          <div className="flex-1 min-w-0"><p className="font-medium truncate text-gray-900">{item.name}</p><p className="text-gray-500 text-xs">Qty: {item.quantity}</p></div>
                          <div className="flex flex-col items-end gap-1"><p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p><button onClick={() => dispatch(removeFromCart(item._id))} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"><Trash2 size={14} /></button></div>
                      </div>
                  ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
                  <div className="flex justify-between text-gray-600"><span>Tax (2%)</span><span>${tax.toFixed(2)}</span></div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing || isVerifying || safeAddresses.length === 0 || activeGateways.length === 0}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                  {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <ShieldCheck size={20} />}
                  {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
          </div>
      </div>
      
      <CheckoutAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} userId={userId} addressToEdit={addressToEdit} />
    </div>
  );
}