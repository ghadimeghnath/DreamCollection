"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, setCart } from "@/features/cart/cartSlice";
import { createOrder } from "@/features/order/actions";
import { processPayment } from "@/features/checkout/actions";
import { validateCart } from "@/features/cart/actions";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Plus, Loader2, ShieldCheck, AlertCircle, Pencil, Trash2, X, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import CheckoutAddressModal from "./CheckoutAddressModal";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function Checkout({ userId, savedAddresses = [], availableGateways = [] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  
  // 1. DEFENSIVE SELECTOR: Safe access to Redux state
  const cartState = useAppSelector((state) => state.cart || {});
  const items = Array.isArray(cartState?.items) ? cartState.items : [];
  const totalPrice = cartState?.totalPrice || 0;

  // FIX: Ensure safeAddresses is always an array
  const safeAddresses = Array.isArray(savedAddresses) ? savedAddresses : [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(availableGateways[0]?.id || "");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);

  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. SERVER-SIDE VALIDATION
  useEffect(() => {
    if (!isMounted) return;

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
                if (result.cart?.items?.length !== items.length) { router.push('/cart'); }
            }
        } catch (error) { console.error("Validation error:", error); } 
        finally { setIsVerifying(false); }
    };
    verifyStock();
  }, [isMounted]);

  // 3. LOADING STATE
  if (!isMounted || (isVerifying && items.length > 0)) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" /><p className="text-gray-500 font-medium">Loading checkout...</p></div>;
  }

  // 4. EMPTY STATE
  if (items.length === 0) {
     return <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"><div className="bg-gray-100 p-4 rounded-full mb-4"><AlertCircle className="h-8 w-8 text-gray-400" /></div><h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2><Link href="/"><button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium">Return to Shop</button></Link></div>
  }

  const handlePlaceOrder = async () => {
    if (safeAddresses.length === 0) return addToast("Add shipping address", "warning");
    if (!paymentMethod) return addToast("Select payment method", "warning");

    setIsProcessing(true);

    const addressToUse = safeAddresses[selectedAddressIndex];
    const orderRes = await createOrder(userId, {
        shippingAddress: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            zip: addressToUse.zip,
            country: addressToUse.country,
            phone: addressToUse.phone 
        },
        paymentMethod
    });

    if (!orderRes.success) {
        addToast(orderRes.error, "error");
        setIsProcessing(false);
        return;
    }

    const paymentRes = await processPayment(orderRes.orderId);

    if (!paymentRes.success) {
        addToast(paymentRes.error, "error");
        setIsProcessing(false);
        return;
    }

    dispatch(clearCart());

    if (paymentRes.type === 'stripe') {
        setStripePromise(loadStripe(paymentRes.publishableKey));
        setClientSecret(paymentRes.clientSecret);
        setIsStripeModalOpen(true);
        // Note: isProcessing stays true until modal closes or payment completes
    } 
    else if (paymentRes.type === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
            addToast("Razorpay SDK failed to load", "error");
            setIsProcessing(false);
            return;
        }

        const options = {
            key: paymentRes.keyId,
            amount: paymentRes.amount,
            currency: paymentRes.currency,
            name: "Dream Collection",
            description: "Order Payment",
            order_id: paymentRes.orderId,
            handler: function (response) {
                // Success
                router.push(`/profile?success=true`);
            },
            modal: {
                ondismiss: function() {
                    setIsProcessing(false);
                    addToast("Payment cancelled", "info");
                }
            },
            prefill: {
                contact: addressToUse.phone
            },
            theme: { color: "#4F46E5" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    } 
    else if (paymentRes.type === 'manual') {
        const gateway = availableGateways.find(g => g.id === paymentMethod);
        
        if (paymentMethod === 'whatsapp') {
             const config = gateway.config;
             const orderId = orderRes.orderId.slice(-6).toUpperCase();
             const total = (totalPrice * 1.02).toFixed(2);
             const message = `*New Order: #${orderId}*
Total: ₹${total}
Pay to: ${config.upiId}
Address: ${addressToUse.street}, ${addressToUse.zip}
${config.instructions}`;
             window.location.href = `https://wa.me/${config.phone}?text=${encodeURIComponent(message)}`;
        } else {
             addToast("Order placed successfully!", "success");
             router.push(`/profile?success=true`);
        }
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
        
        {/* Address Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> Shipping</h2>
                <button onClick={openAddModal} className="text-sm text-indigo-600 hover:underline flex items-center gap-1"><Plus size={16}/> New Address</button>
            </div>
            {safeAddresses.length > 0 ? (
                <div className="grid gap-4">
                   {safeAddresses.map((addr, idx) => (
                      <div key={addr._id} onClick={() => setSelectedAddressIndex(idx)} className={`p-4 border rounded-lg cursor-pointer relative ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/30' : 'hover:border-gray-300'}`}>
                         {selectedAddressIndex === idx && <CheckCircle className="absolute top-3 right-3 text-indigo-600" size={18} />}
                         <p className="font-medium">{addr.street}</p>
                         <p className="text-sm text-gray-500">{addr.city}, {addr.zip}</p>
                      </div>
                   ))}
                </div>
            ) : <div className="text-center py-8 text-gray-500">No addresses found.</div>}
        </div>

        {/* Payment Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> Payment</h2>
            <div className="space-y-3">
               {availableGateways.length > 0 ? availableGateways.map((gw) => (
                  <label key={gw.id} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer ${paymentMethod === gw.id ? 'border-indigo-600 bg-indigo-50/40' : 'hover:border-gray-300'}`}>
                      <input type="radio" name="payment" value={gw.id} checked={paymentMethod === gw.id} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-indigo-600" />
                      <div className="flex-1">
                          <span className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                              {gw.id === 'whatsapp' ? <MessageCircle size={18} className="text-green-600"/> : gw.id === 'stripe' ? <ShieldCheck size={18} className="text-indigo-600"/> : <CheckCircle size={18}/>} 
                              {gw.label}
                          </span>
                          <p className="text-xs text-gray-500">{gw.description || "Secure payment"}</p>
                      </div>
                  </label>
               )) : <p className="text-sm text-yellow-600">No payment methods available.</p>}
            </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Summary */}
      <div className="lg:w-96 shrink-0 w-full">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                  {items.map(i => (
                      <div key={i._id} className="flex justify-between text-sm">
                          <span className="truncate w-32">{i.name} (x{i.quantity})</span>
                          <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                      </div>
                  ))}
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                  <span>Total</span><span>${(totalPrice * 1.02).toFixed(2)}</span>
              </div>
              <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center">
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Place Order"}
              </button>
          </div>
      </div>
      
      <CheckoutAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} userId={userId} addressToEdit={addressToEdit} />

      {/* STRIPE MODAL UI */}
      {isStripeModalOpen && clientSecret && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
                <button 
                    onClick={() => { setIsStripeModalOpen(false); setIsProcessing(false); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20}/>
                </button>
                <h3 className="font-bold text-lg mb-6">Complete Payment</h3>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <StripePaymentForm onSuccess={() => router.push('/profile?success=true')} />
                </Elements>
            </div>
        </div>
      )}
    </div>
  );
}

function StripePaymentForm({ onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [msg, setMsg] = useState("");
    const [isPaying, setIsPaying] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsPaying(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: `${window.location.origin}/profile?success=true` },
        });

        if (error) {
            setMsg(error.message);
            setIsPaying(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {msg && <p className="text-red-500 text-sm">{msg}</p>}
            <button disabled={!stripe || isPaying} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold disabled:opacity-50">
                {isPaying ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
}