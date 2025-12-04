"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { clearCart } from "@/features/cart/cartSlice";
import { createOrder } from "@/features/order/actions";
import { useRouter } from "next/navigation";
import { MapPin, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

export default function Checkout({ userId, savedAddresses }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalPrice } = useAppSelector((state) => state.cart);

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);

  // If no items, redirect or show message
  if (items.length === 0) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Link href="/" className="text-indigo-600 underline">Go back to shopping</Link>
        </div>
    )
  }

  const handlePlaceOrder = async () => {
    // Validation
    if (!savedAddresses || savedAddresses.length === 0) {
        alert("Please add a shipping address first.");
        return;
    }

    setIsProcessing(true);
    const addressToUse = savedAddresses[selectedAddressIndex];

    // Call Server Action
    const result = await createOrder(userId, {
        shippingAddress: {
            street: addressToUse.street,
            city: addressToUse.city,
            state: addressToUse.state,
            zip: addressToUse.zip,
            country: addressToUse.country
        },
        paymentMethod
    });

    if (result.success) {
        // Clear Client Redux Cart
        dispatch(clearCart());
        // Redirect to success/profile page
        router.push(`/profile?success=true`);
    } else {
        alert(result.error);
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10">
      
      {/* LEFT COLUMN: Steps */}
      <div className="flex-1 space-y-8">
        
        {/* Step 1: Address */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">1. Shipping Address</h2>
                <Link href="/profile" className="text-sm text-indigo-600 font-medium hover:underline">
                    Manage Addresses
                </Link>
            </div>

            {savedAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedAddresses.map((addr, idx) => (
                        <div 
                            key={addr._id}
                            onClick={() => setSelectedAddressIndex(idx)}
                            className={`cursor-pointer border rounded-lg p-4 relative transition ${selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            {selectedAddressIndex === idx && (
                                <div className="absolute top-2 right-2 text-indigo-600">
                                    <CheckCircle size={18} fill="currentColor" className="text-white" />
                                </div>
                            )}
                            <p className="font-medium text-gray-900">{addr.street}</p>
                            <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zip}</p>
                            <p className="text-sm text-gray-500">{addr.country}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-3">No addresses found.</p>
                    <Link href="/profile">
                        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
                            <Plus size={16} className="inline mr-1" /> Add Address in Profile
                        </button>
                    </Link>
                </div>
            )}
        </div>

        {/* Step 2: Payment */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">2. Payment Method</h2>
            <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                        type="radio" 
                        name="payment" 
                        value="COD" 
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-gray-900">Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg opacity-60 cursor-not-allowed bg-gray-50">
                    <input type="radio" name="payment" disabled />
                    <div>
                        <span className="font-medium text-gray-900">Credit/Debit Card</span>
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">Coming Soon</span>
                    </div>
                </label>
            </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Summary */}
      <div className="lg:w-96 shrink-0">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                  {items.map(item => (
                      <div key={item._id} className="flex gap-3 text-sm">
                          <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden shrink-0">
                              <img src={item.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${item.price * item.quantity}</p>
                      </div>
                  ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                      <span>Tax (2%)</span>
                      <span>${(totalPrice * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                      <span>Total</span>
                      <span>${(totalPrice * 1.02).toFixed(2)}</span>
                  </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing || savedAddresses.length === 0}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                  {isProcessing ? 'Processing...' : 'Place Order'}
              </button>
          </div>
      </div>
    </div>
  );
}