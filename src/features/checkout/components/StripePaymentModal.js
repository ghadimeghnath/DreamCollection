"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { X, Loader2, Lock, ShieldCheck } from "lucide-react";

// 1. Form Component (Internal)
function StripePaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Confirm Payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Ensure this URL is absolute and correct for your environment
          return_url: `${window.location.origin}/profile?success=true`,
        },
      });

      // 2. Handle Logic Error (e.g., card declined, validation failed)
      // This block only runs if stripe.confirmPayment returns an error object.
      // If payment succeeds, the page redirects immediately, so this code is skipped.
      if (error) {
        console.error("Stripe Logic Error:", error);
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      }
    } catch (err) {
      // 3. Handle System/Integration Error
      // This runs if the function throws an exception (e.g., misconfiguration)
      console.error("Stripe System Error:", err);
      setErrorMessage(err.message || "An unexpected system error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-100 font-medium">
           {/* Display the REAL error message now */}
           {errorMessage}
        </div>
      )}
      
      <button 
        disabled={!stripe || isProcessing} 
        className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-70 transition flex items-center justify-center gap-2 shadow-md"
      >
        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
        {isProcessing ? "Processing..." : "Pay Securely"}
      </button>
      
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
        <ShieldCheck size={14} className="text-emerald-500"/>
        <span>256-bit SSL Encrypted</span>
      </div>
    </form>
  );
}

// 2. Main Modal Component (Uses Portal)
export default function StripePaymentModal({ clientSecret, stripePromise, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Optional: Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  if (!mounted || !clientSecret || !stripePromise) return null;

  // Render to document.body to escape parent stacking contexts
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-2">
            <div>
                <h3 className="font-bold text-xl text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">Complete your purchase</p>
            </div>
            <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
            >
                <X size={24}/>
            </button>
        </div>
        
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm />
        </Elements>
      </div>
    </div>,
    document.body
  );
}