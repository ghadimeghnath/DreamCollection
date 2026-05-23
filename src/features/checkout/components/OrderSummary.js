"use client";

import { useState, useEffect, useMemo } from "react";
import currency from "currency.js"; // Ensure to install: npm install currency.js
import { Tag, Truck, Info, ChevronRight, Loader2, ShieldCheck, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Configuration for Shipping/Fees
const SHIPPING_THRESHOLD = 500.00; // Free shipping over $500
const FLAT_SHIPPING_RATE = 15.00;
const TAX_RATE = 0.02; // 2% GST/Tax

// Mock Coupons (In production, pass these as props or fetch from API)
const AVAILABLE_COUPONS = {
  'WELCOME10': { type: 'fixed', value: 15.00, code: 'WELCOME10' },
  'SAVE20': { type: 'percent', value: 0.20, code: 'SAVE20' },
};

export default function OrderSummary({ 
  items = [], 
  subtotal = 0, 
  shippingAddress = null, 
  onPlaceOrder, 
  isProcessing,
  canCheckout
}) {
  const [promoInput, setPromoInput] = useState("");
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // --- Dynamic Calculations ---
  const totals = useMemo(() => {
    const subTotalVal = currency(subtotal);
    
    // 1. Shipping Logic
    let shippingVal = currency(FLAT_SHIPPING_RATE);
    let isFreeShipping = false;

    if (subTotalVal.value > SHIPPING_THRESHOLD) {
        shippingVal = currency(0);
        isFreeShipping = true;
    } else if (shippingAddress?.state === 'NY' || shippingAddress?.state === 'CA') {
        // Example: Specific logic for states (if address provided)
        shippingVal = currency(12.00); 
    }

    // 2. Tax Calculation
    const taxVal = subTotalVal.multiply(TAX_RATE);

    // 3. Discount Logic
    let discountVal = currency(0);
    if (activeCoupon) {
        if (activeCoupon.type === 'fixed') {
            discountVal = currency(activeCoupon.value);
        } else if (activeCoupon.type === 'percent') {
            discountVal = subTotalVal.multiply(activeCoupon.value);
        }
    }

    // 4. Final Total
    const finalTotal = subTotalVal.add(shippingVal).add(taxVal).subtract(discountVal);

    return {
        subtotal: subTotalVal,
        shipping: shippingVal,
        tax: taxVal,
        discount: discountVal,
        total: finalTotal,
        isFreeShipping
    };
  }, [subtotal, shippingAddress, activeCoupon]);

  // --- Handlers ---
  const handleApplyCoupon = () => {
    setPromoError("");
    setSuccessMsg("");
    
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (AVAILABLE_COUPONS[code]) {
        setActiveCoupon(AVAILABLE_COUPONS[code]);
        setSuccessMsg(`Coupon ${code} applied!`);
    } else {
        setPromoError("Invalid promo code");
        setActiveCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
      setActiveCoupon(null);
      setPromoInput("");
      setSuccessMsg("");
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
      <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>

      {/* Cart Items Preview (Scrollable) */}
      <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar border-b border-gray-100 pb-4">
        {items.map((item) => (
          <div key={item._id} className="flex gap-3 text-sm group">
             <div className="w-10 h-10 bg-gray-50 rounded border border-gray-100 shrink-0 overflow-hidden relative">
                <img src={item.image} alt="" className="w-full h-full object-contain mix-blend-multiply" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate group-hover:text-indigo-600 transition">{item.name}</p>
                <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
             </div>
             <p className="font-medium text-gray-900">${currency(item.price * item.quantity).toString()}</p>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Promo Code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    disabled={!!activeCoupon}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
            </div>
            {activeCoupon ? (
                 <button onClick={handleRemoveCoupon} className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 rounded-lg border border-red-100">
                    Remove
                 </button>
            ) : (
                <button 
                    onClick={handleApplyCoupon}
                    disabled={!promoInput}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Apply
                </button>
            )}
          </div>
          {promoError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><Info size={12}/> {promoError}</p>}
          {successMsg && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> {successMsg}</p>}
      </div>

      {/* Financial Line Items */}
      <div className="space-y-3 text-sm text-gray-600">
         <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{totals.subtotal.format()}</span>
         </div>
         
         <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5">
                Shipping 
                {shippingAddress && <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono">{shippingAddress.zip}</span>}
            </span>
            {totals.isFreeShipping ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                    Free <Truck size={12}/>
                </span>
            ) : (
                <span>{totals.shipping.format()}</span>
            )}
         </div>

         <div className="flex justify-between">
             <span className="flex items-center gap-1">Estimated Tax <span className="text-gray-300 text-[10px]">(2%)</span></span>
             <span>{totals.tax.format()}</span>
         </div>

         {/* Dynamic Discount Line */}
         {activeCoupon && (
             <div className="flex justify-between text-green-700 bg-green-50 px-2 py-1 -mx-2 rounded">
                 <span className="font-medium flex items-center gap-1">Discount ({activeCoupon.code})</span>
                 <span>-{totals.discount.format()}</span>
             </div>
         )}
         
         {/* Final Total */}
         <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-4">
             <div>
                 <span className="block font-bold text-lg text-gray-900">Total</span>
                 {activeCoupon && (
                     <span className="text-xs text-gray-400 line-through mr-2">
                        {totals.subtotal.add(totals.shipping).add(totals.tax).format()}
                     </span>
                 )}
             </div>
             <div className="text-right">
                 <span className="block font-bold text-2xl text-gray-900">{totals.total.format()}</span>
             </div>
         </div>
      </div>

      {/* Main Checkout Action */}
      <button 
        onClick={() => onPlaceOrder(totals.total.value, activeCoupon?.code)}
        disabled={isProcessing || !canCheckout}
        className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : null}
        {isProcessing ? "Processing..." : (
            <>
                Pay {totals.total.format()} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
            </>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
         <ShieldCheck size={12} /> Secure 256-bit Encrypted Payment
      </p>
    </div>
  );
}