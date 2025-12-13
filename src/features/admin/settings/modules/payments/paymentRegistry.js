import { MessageCircle, Banknote, CreditCard, Smartphone, DollarSign } from "lucide-react";

export const PAYMENT_GATEWAYS = [
  {
    id: "whatsapp",
    label: "Order on WhatsApp",
    description: "Allow customers to place orders via WhatsApp message and pay via UPI.",
    icon: <MessageCircle size={24} className="text-green-600" />,
    supportsRedirect: true, 
    fields: [
      { name: "phone", label: "WhatsApp Number (with country code)", type: "tel", placeholder: "919876543210", required: true },
      { name: "upiId", label: "UPI ID (VPA)", type: "text", placeholder: "merchant@upi", required: true },
      { name: "instructions", label: "Payment Instructions", type: "textarea", placeholder: "Please pay via UPI and share screenshot...", rows: 3 }
    ]
  },
  {
    id: "cod",
    label: "Cash on Delivery (COD)",
    description: "Accept cash payments when the order is delivered.",
    icon: <Banknote size={24} className="text-gray-600" />,
    supportsRedirect: false,
    fields: [
      { name: "label", label: "Checkout Label", type: "text", defaultValue: "Cash on Delivery", required: true },
      { name: "additionalFee", label: "Additional Fee (Optional)", type: "number", placeholder: "0" }
    ]
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Accept credit/debit cards securely via Stripe.",
    icon: <CreditCard size={24} className="text-indigo-600" />,
    supportsRedirect: true,
    fields: [
      { name: "publishableKey", label: "Publishable Key", type: "text", required: true },
      { name: "secretKey", label: "Secret Key", type: "password", required: true }
    ]
  },
  {
    id: "razorpay",
    label: "Razorpay",
    description: "Indian payment gateway for Cards, UPI, and Netbanking.",
    icon: <Smartphone size={24} className="text-blue-600" />,
    supportsRedirect: true,
    fields: [
      { name: "keyId", label: "Key ID", type: "text", required: true },
      { name: "keySecret", label: "Key Secret", type: "password", required: true }
    ]
  }
];

export const getGatewayConfig = (id) => PAYMENT_GATEWAYS.find(g => g.id === id);