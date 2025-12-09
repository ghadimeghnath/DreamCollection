"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, setCart, removeFromCart } from "@/features/cart/cartSlice"; 
import { createOrder } from "@/features/order/actions";
import { validateCart } from "@/features/cart/actions";
import { getStoreSettings } from "@/features/admin/settingsActions"; // Import settings fetcher
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Plus, Loader2, ShieldCheck, AlertCircle, Pencil, Trash2, MessageCircle } from "lucide-react"; 
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import CheckoutAddressModal from "./CheckoutAddressModal";

export default function Checkout({ userId, savedAddresses = [] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  // Safe default for items
  const cartState = useAppSelector((state) => state.cart || {});
  const items = Array.isArray(cartState?.items) ? cartState.items : [];
  const totalPrice = cartState?.totalPrice || 0;

  const safeAddresses = Array.isArray(savedAddresses) ? savedAddresses : [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null); 
  const [storeSettings, setStoreSettings] = useState(null); // Settings State

  useEffect(() => {
    setIsMounted(true);
    // Fetch store settings for WhatsApp config
    getStoreSettings().then(setStoreSettings);
  }, []);

  // 1. Initial Verification on Load
  useEffect(() => {
    const verifyStock = async () => {
        if (items.length === 0) { 
            setIsVerifying(false);
            return;
        }
        
        try {
            const result = await validateCart(items);
            if (result?.warnings?.length > 0) {
                result.warnings.forEach(w => addToast(w, "error"));
                if (result.cart) dispatch(setCart(result.cart)); 
                
                if (result.cart?.items?.length !== items.length) {
                    router.push('/cart'); 
                }
            }
        } catch (error) {
            console.error("Cart validation error:", error);
        } finally {
            setIsVerifying(false);
        }
    };
    verifyStock();
  }, [isMounted]);

  if (!isMounted || (isVerifying && items.length > 0)) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Securing your checkout...</p>
        </div>
    );
  }

  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add items to your cart to proceed.</p>
            <Link href="/" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition">
                Return to Shop
            </Link>
        </div>
    )
  }

  const handlePlaceOrder = async () => {
    if (safeAddresses.length === 0) {
        addToast("Please add a shipping address first.", "warning");
        return;
    }

    setIsProcessing(true);

    try {
        const validation = await validateCart(items);
        if (validation?.warnings?.length > 0) {
            validation.warnings.forEach(w => addToast(w, "error"));
            if (validation.cart) dispatch(setCart(validation.cart));
            setIsProcessing(false);
            return; 
        }
    } catch (error) {
        addToast("Validation failed. Please try again.", "error");
        setIsProcessing(false);
        return;
    }

    const addressToUse = safeAddresses[selectedAddressIndex];
    const selectedMethod = paymentMethod === 'WhatsApp' ? 'WhatsApp' : 'COD';

    const result = await createOrder(userId, {
        shippingAddress: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            zip: addressToUse.zip,
            country: addressToUse.country,
            phone: addressToUse.phone 
        },
        paymentMethod: selectedMethod
    });

    if (result.success) {
        dispatch(clearCart());
        
        // --- WhatsApp Logic ---
        if (selectedMethod === 'WhatsApp' && storeSettings?.whatsappNumber) {
            const orderId = result.orderId.slice(-6).toUpperCase();
            const total = (totalPrice * 1.02).toFixed(2); // Include tax
            
            // Construct Message
            const message = `*New Order: #${orderId}*
---------------------------
*Total Amount:* ₹${total}
*Payment:* UPI (${storeSettings.upiId})

*Shipping To:*
${addressToUse.street}, ${addressToUse.city}
${addressToUse.state} - ${addressToUse.zip}

*Items:*
${items.map(i => `• ${i.name} (x${i.quantity})`).join('\n')}
---------------------------
${storeSettings.instructions || "Please confirm payment for processing."}`;

            const encodedMsg = encodeURIComponent(message);
            const waLink = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodedMsg}`;
            
            // Redirect to WhatsApp
            window.location.href = waLink;
        } else {
            addToast("Order placed successfully!", "success");
            router.push(`/profile?success=true`);
        }
    } else {
        addToast(result.error || "Failed to place order", "error");
        setIsProcessing(false);
    }
  };

  const openAddModal = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const openEditModal = (e, addr) => {
    e.stopPropagation(); 
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const tax = totalPrice * 0.02;
  const finalTotal = totalPrice + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 flex flex-col lg:flex-row gap-8 lg:gap-12">
      
      {/* LEFT COLUMN: Steps */}
      <div className="flex-1 space-y-6">
        
        {/* Step 1: Address */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Shipping Address
                </h2>
                <button 
                    onClick={openAddModal}
                    className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                    <Plus size={16} /> New Address
                </button>
            </div>

            {safeAddresses.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {safeAddresses.map((addr, idx) => (
                        <div 
                            key={addr._id}
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`cursor-pointer border rounded-lg p-4 relative transition-all group ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            {selectedAddressIndex === idx && (
                                <div className="absolute top-3 right-3 text-indigo-600">
                                    <CheckCircle size={20} fill="currentColor" className="text-white" />
                                </div>
                            )}
                            
                            <button
                                onClick={(e) => openEditModal(e, addr)}
                                className={`absolute top-3 text-gray-400 hover:text-indigo-600 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 transition-opacity ${selectedAddressIndex === idx ? 'right-10' : 'right-3'} opacity-100 lg:opacity-0 lg:group-hover:opacity-100`}
                                title="Edit Address"
                            >
                                <Pencil size={16} />
                            </button>

                            <p className="font-medium text-gray-900 mb-1 pr-8">{addr.street}</p>
                            <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-gray-500">{addr.country}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-3 text-sm">No delivery addresses found.</p>
                    <button 
                        onClick={openAddModal}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition"
                    >
                        <Plus size={16} className="inline mr-1" /> Add Address
                    </button>
                </div>
            )}
        </div>

        {/* Step 2: Payment */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                Payment Method
            </h2>
            <div className="space-y-3">
                
                {/* WhatsApp Option */}
                {storeSettings?.isWhatsAppEnabled && (
                    <label className={`
                        flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                        ${paymentMethod === 'WhatsApp' ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                    `}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="WhatsApp" 
                            checked={paymentMethod === 'WhatsApp'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500 shrink-0"
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-gray-900 text-sm">Order on WhatsApp</span>
                                <MessageCircle size={20} className="text-green-600" />
                            </div>
                            <p className="text-xs text-gray-500">Pay via UPI & Confirm Order directly on WhatsApp.</p>
                        </div>
                    </label>
                )}

                {/* COD Option */}
                <label className={`
                      flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200
                      ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}>
                      <input 
                          type="radio" 
                          name="payment" 
                          value="COD" 
                          checked={paymentMethod === 'COD'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 shrink-0"
                      />
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900 text-sm">Cash on Delivery</span>
                              {/* <Truck size={18} className="text-gray-400" /> */}
                          </div>
                          <p className="text-xs text-gray-500">Pay securely with cash when your order arrives.</p>
                      </div>
                  </label>

                  {/* Online Payment (Placeholder) */}
                  <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl opacity-60 cursor-not-allowed bg-gray-50 select-none">
                      <input type="radio" name="payment" disabled className="w-5 h-5 shrink-0" />
                      <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900 text-sm">Credit / Debit Card</span>
                              {/* <CreditCard size={18} className="text-gray-400" /> */}
                          </div>
                          <p className="text-xs text-gray-500">Secure online payment (Coming Soon)</p>
                      </div>
                  </label>
            </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Summary */}
      <div className="lg:w-96 shrink-0 w-full">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1 scrollbar-thin">
                  {items.map(item => (
                      <div key={item._id} className="flex gap-3 text-sm group relative">
                          <div className="w-16 h-16 bg-white rounded-md border border-gray-200 overflow-hidden shrink-0">
                              <img src={item.image} className="w-full h-full object-cover mix-blend-multiply" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-gray-900" title={item.name}>{item.name}</p>
                              <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                              <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                              
                              {/* NEW: Remove Item Button */}
                              <button 
                                onClick={() => dispatch(removeFromCart(item._id))}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                                title="Remove Item"
                              >
                                <Trash2 size={14} />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6 text-sm">
                  <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                      <span>Tax (2%)</span>
                      <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                  </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing || isVerifying || safeAddresses.length === 0}
                className={`w-full text-white py-3.5 rounded-lg font-bold transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2
                    ${paymentMethod === 'WhatsApp' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                `}
              >
                  {isProcessing ? (
                      <><Loader2 className="animate-spin" size={20}/> Processing...</>
                  ) : isVerifying ? (
                      <><Loader2 className="animate-spin" size={20}/> Checking Stock...</>
                  ) : paymentMethod === 'WhatsApp' ? (
                      <>Order via WhatsApp <MessageCircle size={20} /></>
                  ) : (
                      <>Place Order <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" /></>
                  )}
              </button>
              
              <p className="text-xs text-center text-gray-400 mt-3">
                By placing this order, you agree to our Terms of Service.
              </p>
          </div>
      </div>
      
      {/* Address Modal */}
      <CheckoutAddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)}
        userId={userId}
        addressToEdit={addressToEdit} // Pass selected address
      />
    </div>
  );
}