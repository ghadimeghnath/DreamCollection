import Stripe from 'stripe';
import Razorpay from 'razorpay';

export const initiatePayment = async (gatewayId, order, settings) => {
  // Find config for the selected gateway
  const gatewaySettings = settings.paymentGateways.find(g => g.id === gatewayId);
  const config = gatewaySettings?.config || {};

  if (!gatewaySettings || !gatewaySettings.enabled) {
    throw new Error(`Payment method ${gatewayId} is not available.`);
  }

  switch (gatewayId) {
    case 'stripe':
      return await createStripeIntent(order, config);
    case 'razorpay':
      return await createRazorpayOrder(order, config);
    default:
      throw new Error(`Unsupported gateway: ${gatewayId}`);
  }
};

const createStripeIntent = async (order, config) => {
  // FIX: Trim keys to prevent whitespace errors
  const secretKey = config.secretKey?.trim();
  const publishableKey = config.publishableKey?.trim();

  if (!secretKey) throw new Error("Stripe Secret Key missing in settings");

  try {
    const stripe = new Stripe(secretKey);
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects cents
      currency: (config.currency || 'usd').toLowerCase(), 
      metadata: { orderId: order._id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      publishableKey: publishableKey,
      type: 'stripe'
    };
  } catch (error) {
    console.error("Stripe Init Error:", error);
    // Return generic error to client
    throw new Error("Payment system misconfigured. Please contact support.");
  }
};

const createRazorpayOrder = async (order, config) => {
  // FIX: Trim keys
  const keyId = config.keyId?.trim();
  const keySecret = config.keySecret?.trim();

  if (!keyId || !keySecret) throw new Error("Razorpay Keys missing in settings");

  try {
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(order.totalAmount * 100), // Razorpay expects paise
      currency: config.currency || "INR",
      receipt: order._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return {
      orderId: razorpayOrder.id,
      keyId: keyId,
      amount: options.amount,
      currency: options.currency,
      type: 'razorpay'
    };
  } catch (error) {
    console.error("Razorpay Init Error:", error);
    throw new Error("Payment system misconfigured. Please contact support.");
  }
};