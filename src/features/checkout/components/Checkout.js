"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, setCart } from "@/features/cart/cartSlice";
import { createOrder } from "@/features/order/actions";
import { processPayment } from "@/features/checkout/actions";
import { validateCart } from "@/features/cart/actions";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Plus, Loader2, ShieldCheck, AlertCircle, CreditCard, Banknote, MessageCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import CheckoutAddressModal from "./CheckoutAddressModal";
import StripePaymentModal from "./StripePaymentModal";
import OrderSummary from "./OrderSummary"; //

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";

// ... (loadCashfreeSdk Helper remains unchanged) ...
const loadCashfreeSdk = () => {
    return new Promise((resolve) => {
        if (window.Cashfree) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout({ userId, savedAddresses = [], availableGateways = [] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  const cartState = useAppSelector((state) => state.cart || {});
  const items = Array.isArray(cartState?.items) ? cartState.items : [];
  const totalPrice = cartState?.totalPrice || 0;
  const safeAddresses = Array.isArray(savedAddresses) ? savedAddresses : [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(availableGateways[0]?.id || "");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  // Stripe State
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Validate Stock on Mount
  useEffect(() => {
    const verifyStock = async () => {
        if (items.length === 0) { setIsVerifying(false); return; }
        try {
            const result = await validateCart(items); //
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

  // --- UPDATED PLACE ORDER LOGIC ---
  // Now accepts finalAmount and couponCode from OrderSummary
  const handlePlaceOrder = async (finalAmount, couponCode) => {
    if (safeAddresses.length === 0) return addToast("Add shipping address", "warning");
    if (!paymentMethod) return addToast("Select payment method", "warning");

    setIsProcessing(true);

    const addressToUse = safeAddresses[selectedAddressIndex];
    
    // 1. Create Order
    // Note: We pass paymentMethod and address. 
    // If your backend supports 'couponCode', add it to the payload here.
    const orderRes = await createOrder(userId, { //
        shippingAddress: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            zip: addressToUse.zip,
            country: addressToUse.country,
            phone: addressToUse.phone 
        },
        paymentMethod,
        couponCode // Passing this to backend (ensure backend handles it or ignores it)
    });

    if (!orderRes.success) {
        addToast(orderRes.error, "error");
        setIsProcessing(false);
        return;
    }

    // 2. Process Payment Intent
    const paymentRes = await processPayment(orderRes.orderId); //

    if (!paymentRes.success) {
        addToast(paymentRes.error, "error");
        setIsProcessing(false);
        return;
    }

    // 3. Handle Gateways
    if (paymentRes.type === 'stripe') {
        setStripePromise(loadStripe(paymentRes.publishableKey));
        setClientSecret(paymentRes.clientSecret);
        setIsStripeModalOpen(true);
    } 
    else if (paymentRes.type === 'cashfree') {
        const loaded = await loadCashfreeSdk();
        if (!loaded) {
            addToast("Cashfree SDK failed to load", "error");
            setIsProcessing(false);
            return;
        }
        const cashfree = new window.Cashfree({
            mode: paymentRes.isSandbox ? "sandbox" : "production"
        });
        cashfree.checkout({
            paymentSessionId: paymentRes.paymentSessionId,
            returnUrl: `${window.location.origin}/profile?success=true&order_id={order_id}`
        });
    }
    else if (paymentRes.type === 'manual') {
        dispatch(clearCart()); 
        
        // WhatsApp Logic
        if (paymentMethod === 'whatsapp') {
            const waConfig = availableGateways.find(g => g.id === 'whatsapp')?.config || {};
            if (waConfig.phone) {
                const phone = waConfig.phone.replace(/\D/g, '');
                const text = encodeURIComponent(
                    `Hi! I placed order #${orderRes.orderId.slice(-6).toUpperCase()} for ${items.length} items.\n` +
                    `Total Amount: $${finalAmount.toFixed(2)}\n` + // Use dynamic finalAmount
                    (couponCode ? `Coupon Applied: ${couponCode}\n` : '') +
                    `Please confirm my order.`
                );
                window.location.href = `https://wa.me/${phone}?text=${text}`;
                return;
            }
        }

        router.push(`/profile?success=true&order_id=${orderRes.orderId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* LEFT COLUMN: Address & Payment */}
        <div className="flex-1 space-y-8">
            {/* Address Section */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-indigo-600" size={20}/> Shipping Address
                    </h2>
                    {safeAddresses.length > 0 && safeAddresses.length < 2 && (
                       <button onClick={() => { setAddressToEdit(null); setIsAddressModalOpen(true); }} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
                           <Plus size={16}/> Add New
                       </button>
                    )}
                </div>

                {safeAddresses.length === 0 ? (
                    <button onClick={() => setIsAddressModalOpen(true)} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition bg-gray-50 hover:bg-white group">
                        <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition"><Plus size={24} /></div>
                        <span className="font-medium">Add Delivery Address</span>
                    </button>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {safeAddresses.map((addr, idx) => (
                            <div 
                                key={addr._id} 
                                onClick={() => setSelectedAddressIndex(idx)}
                                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600' : 'border-gray-200 hover:border-indigo-300 bg-white'}`}
                            >
                                {selectedAddressIndex === idx && <div className="absolute top-4 right-4 text-indigo-600"><CheckCircle size={20} className="fill-indigo-100"/></div>}
                                <p className="font-bold text-gray-900 mb-1">{addr.street}</p>
                                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                                <p className="text-sm text-gray-600 mb-3">{addr.country}</p>
                                <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">{addr.phone}</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Payment Section */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-indigo-600" size={20}/> Payment Method
                </h2>
                
                {availableGateways.length === 0 ? (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        No payment methods configured. Please contact support.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {availableGateways.map((gateway) => (
                            <label key={gateway.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === gateway.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    checked={paymentMethod === gateway.id}
                                    onChange={() => setPaymentMethod(gateway.id)}
                                />
                                <div className={`p-2 rounded-lg ${paymentMethod === gateway.id ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                    {gateway.id === 'stripe' && <CreditCard size={24} className="text-indigo-600" />}
                                    {gateway.id === 'cashfree' && <Smartphone size={24} className="text-orange-600" />}
                                    {gateway.id === 'cod' && <Banknote size={24} className="text-green-600" />}
                                    {gateway.id === 'whatsapp' && <MessageCircle size={24} className="text-green-500" />}
                                </div>
                                <div>
                                    <span className="block font-medium text-gray-900">{gateway.label}</span>
                                    <span className="block text-xs text-gray-500">{gateway.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </section>
        </div>

        {/* RIGHT COLUMN: New Dynamic Order Summary */}
        <div className="lg:w-96 shrink-0">
             <OrderSummary 
                items={items}
                subtotal={totalPrice}
                shippingAddress={safeAddresses[selectedAddressIndex]}
                onPlaceOrder={handlePlaceOrder}
                isProcessing={isProcessing}
                canCheckout={safeAddresses.length > 0 && !!paymentMethod}
             />
        </div>

        <CheckoutAddressModal 
            isOpen={isAddressModalOpen} 
            onClose={() => setIsAddressModalOpen(false)} 
            userId={userId}
            addressToEdit={addressToEdit}
        />

        {isStripeModalOpen && clientSecret && (
            <StripePaymentModal 
                clientSecret={clientSecret} 
                stripePromise={stripePromise} 
                onClose={() => {
                    setIsStripeModalOpen(false);
                    setIsProcessing(false);
                }}
            />
        )}

    </div>
  );
}