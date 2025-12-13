"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart, setCart } from "@/features/cart/cartSlice"; // kept clearCart for manual payments ONLY
import { createOrder } from "@/features/order/actions";
import { processPayment } from "@/features/checkout/actions";
import { validateCart } from "@/features/cart/actions";
import { useRouter } from "next/navigation";
import { 
    MapPin, CheckCircle, Loader2, AlertCircle, 
    CreditCard, Banknote, Smartphone, ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import CheckoutAddressModal from "./CheckoutAddressModal";
import StripePaymentModal from "./StripePaymentModal"; 
import { loadStripe } from "@stripe/stripe-js";

// Helper for Razorpay
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
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
  
  const cartState = useAppSelector((state) => state.cart || {});
  const items = Array.isArray(cartState?.items) ? cartState.items : [];
  const totalPrice = cartState?.totalPrice || 0;

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState(availableGateways[0]?.id || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Stripe State
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  // Inventory Check on Mount
  useEffect(() => {
    if (!isMounted) return;
    const verifyStock = async () => {
        if (items.length === 0) { setIsVerifying(false); return; }
        try {
            const result = await validateCart(items);
            if (result?.warnings?.length > 0) {
                result.warnings.forEach(w => addToast(w, "error"));
                if (result.cart) dispatch(setCart(result.cart)); 
                if (result.cart?.items?.length !== items.length) router.push('/cart'); 
            }
        } catch (error) { console.error(error); } 
        finally { setIsVerifying(false); }
    };
    verifyStock();
  }, [isMounted]);

  // Loading State
  if (!isMounted || (isVerifying && items.length > 0)) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin h-10 w-10 text-indigo-600 mb-4" /><p className="text-gray-500">Checking inventory...</p></div>;
  }

  // Empty Cart State
  if (items.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4"><AlertCircle className="h-8 w-8 text-gray-400" /></div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
            <Link href="/"><button className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium">Return to Shop</button></Link>
        </div>
     );
  }

  const handlePlaceOrder = async () => {
    if (!savedAddresses?.length) return addToast("Add shipping address", "warning");
    if (!paymentMethod) return addToast("Select payment method", "warning");

    setIsProcessing(true);
    const addressToUse = savedAddresses[selectedAddressIndex];

    try {
        // 1. Create Order
        const orderRes = await createOrder(userId, {
            shippingAddress: { ...addressToUse },
            paymentMethod
        });
        if (!orderRes.success) throw new Error(orderRes.error || "Order creation failed");

        // 2. Process Payment
        const paymentRes = await processPayment(orderRes.orderId);
        if (!paymentRes.success) throw new Error(paymentRes.error || "Payment init failed");

        // 3. Gateway Logic
        if (paymentRes.type === 'stripe') {
            // DO NOT CLEAR CART HERE. Wait for Stripe success redirect.
            setStripePromise(loadStripe(paymentRes.publishableKey));
            setClientSecret(paymentRes.clientSecret);
            setIsStripeModalOpen(true);
            // keep isProcessing true so UI stays locked
        } 
        // ... inside handlePlaceOrder ...

else if (paymentRes.type === 'razorpay') {
    // 1. Load the Script
    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Razorpay SDK failed to load. Check your internet connection.");

    // 2. Initialize Options
    const options = {
        key: paymentRes.keyId, // Comes from backend
        amount: paymentRes.amount, // In paise (e.g., 50000 for 500.00)
        currency: paymentRes.currency,
        name: "Dream Collection",
        description: "Order Payment",
        order_id: paymentRes.orderId, // Razorpay Order ID (starts with order_...)
        
        // Success Handler
        handler: function (response) {
            // Log for debugging
            console.log("Razorpay Payment ID:", response.razorpay_payment_id);
            console.log("Razorpay Signature:", response.razorpay_signature);
            
            // Redirect and Clear Cart
            dispatch(clearCart());
            router.push('/profile?success=true');
        },

        // User Details for Pre-fill
        prefill: {
            name: "Customer", // You could pass user.name here if available
            contact: addressToUse.phone // Important: Prefills phone for UPI
        },
        theme: {
            color: "#4F46E5" // Matches your Indigo theme
        },

        // CRITICAL FIX: Handle Modal Closure
        modal: {
            ondismiss: function() {
                addToast("Payment cancelled", "info");
                setIsProcessing(false); // Unfreeze the button
            }
        }
    };

    // 3. Open Modal
    const rzp = new window.Razorpay(options);
    
    // Handle initialization failures
    rzp.on('payment.failed', function (response){
        addToast(response.error.description || "Payment failed", "error");
        setIsProcessing(false);
    });

    rzp.open();
    // Note: We do NOT set isProcessing(false) here. We wait for handler or ondismiss.
}
        else {
            // Manual Payments (COD/WhatsApp) -> Clear immediately and redirect
            dispatch(clearCart());
            router.push('/profile?success=true');
        }

    } catch (error) {
        console.error("Checkout Error:", error);
        addToast(error.message, "error");
        setIsProcessing(false);
    }
  };

  const selectedAddress = savedAddresses[selectedAddressIndex];
  const taxAmount = totalPrice * 0.02; 
  const finalTotal = totalPrice + taxAmount;

  return (
    <div className="bg-gray-50/50 min-h-screen py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-8">
                {/* Address Selector */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><MapPin className="text-indigo-600" size={24} /> Shipping Address</h2>
                        {savedAddresses.length < 2 && <button onClick={() => setIsAddressModalOpen(true)} className="text-sm text-indigo-600 font-medium hover:underline">+ Add New</button>}
                    </div>
                    {savedAddresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedAddresses.map((addr, idx) => (
                                <div key={idx} onClick={() => setSelectedAddressIndex(idx)} className={`cursor-pointer relative p-4 rounded-lg border-2 transition-all ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-300'}`}>
                                    {selectedAddressIndex === idx && <CheckCircle size={20} className="absolute top-3 right-3 text-indigo-600" />}
                                    <p className="font-semibold text-gray-900">{addr.street}</p>
                                    <p className="text-sm text-gray-500">{addr.city}, {addr.zip}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 border border-dashed rounded-lg">
                            <button onClick={() => setIsAddressModalOpen(true)} className="px-4 py-2 bg-white border rounded-md text-sm font-medium">Add Delivery Address</button>
                        </div>
                    )}
                </section>

                {/* Payment Selector */}
                <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6"><CreditCard className="text-indigo-600" size={24} /> Payment Method</h2>
                    <div className="space-y-3">
                        {availableGateways.map((gw) => (
                            <label key={gw.id} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === gw.id ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200'}`}>
                                <input type="radio" name="payment" className="w-5 h-5 accent-indigo-600" checked={paymentMethod === gw.id} onChange={() => setPaymentMethod(gw.id)} />
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">{gw.label}</p>
                                    <p className="text-xs text-gray-500">{gw.description}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                </section>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-5">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-4 mb-6">
                        {items.map((item) => (
                            <div key={item._id} className="flex gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-50 mix-blend-multiply" />
                                <div className="flex-1"><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${finalTotal.toFixed(2)}</span></div>
                    </div>
                    <button onClick={handlePlaceOrder} disabled={isProcessing} className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-70 flex items-center justify-center gap-2">
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : `Pay $${finalTotal.toFixed(2)}`}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-4 flex justify-center gap-1"><ShieldCheck size={12} /> Secure Checkout</p>
                </div>
            </div>
        </div>

        <CheckoutAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} userId={userId} />

        {/* Modal Logic */}
        {isStripeModalOpen && clientSecret && stripePromise && (
            <StripePaymentModal
                stripePromise={stripePromise}
                clientSecret={clientSecret}
                onClose={() => { setIsStripeModalOpen(false); setIsProcessing(false); }}
            />
        )}
    </div>
  );
}