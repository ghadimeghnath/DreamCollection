import Stripe from 'stripe';
import { headers } from 'next/headers';

export const initiatePayment = async (gatewayId, order, settings) => {
  const gatewaySettings = settings.paymentGateways.find(g => g.id === gatewayId);
  const config = gatewaySettings?.config || {};

  // ✅ PRIORITY 1: Environment Variable (Overrides DB)
  // ✅ PRIORITY 2: Database Settings
  // ✅ PRIORITY 3: Fallback to 'USD'
  const storeCurrency = process.env.NEXT_PUBLIC_STORE_CURRENCY || settings.branding?.currency || 'USD';

  if (!gatewaySettings || !gatewaySettings.enabled) {
    throw new Error(`Payment method ${gatewayId} is not available.`);
  }

  switch (gatewayId) {
    case 'stripe':
      return await createStripeIntent(order, config, storeCurrency);
    case 'cashfree':
      return await createCashfreeOrder(order, config, storeCurrency);
    default:
      throw new Error(`Unsupported gateway: ${gatewayId}`);
  }
};

const createStripeIntent = async (order, config, storeCurrency) => {
  const secretKey = config.secretKey?.trim();
  const publishableKey = config.publishableKey?.trim();

  if (!secretKey) throw new Error("Stripe Secret Key missing in settings");

  try {
    const stripe = new Stripe(secretKey);
    // Use store currency or fallback to USD
    const currencyToUse = (storeCurrency || config.currency || 'usd').toLowerCase();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: currencyToUse, 
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
    throw new Error(error.message || "Failed to initiate Stripe payment");
  }
};

const createCashfreeOrder = async (order, config, storeCurrency) => {
    const appId = config.appId?.trim();
    const secretKey = config.secretKey?.trim();
    const apiVersion = config.apiVersion?.trim() || "2023-08-01";
    
    const isSandbox = config.isSandbox === true || config.isSandbox === "on"; 
    
    const baseUrl = isSandbox ? "https://sandbox.cashfree.com/pg" : "https://api.cashfree.com/pg";

    if (!appId || !secretKey) throw new Error("Cashfree Credentials missing");

    // ✅ ERROR BLOCK RESTORED
    // Now that we have the Env Var, this check passes safely if Env is set to INR
    if (storeCurrency.toUpperCase() !== 'INR') {
        console.error(`CRITICAL: Currency Mismatch. Store: ${storeCurrency}, Gateway: Cashfree (Requires INR)`);
        throw new Error(`Configuration Error: Cashfree supports INR only. Your store is set to ${storeCurrency}. Please set NEXT_PUBLIC_STORE_CURRENCY=INR in your .env file.`);
    }

    try {
        const payload = {
            order_id: order._id.toString(),
            order_amount: order.totalAmount,
            order_currency: storeCurrency, 
            customer_details: {
                customer_id: order.userId.toString(),
                customer_phone: order.shippingAddress.phone || "9999999999",
                customer_name: "Customer" 
            },
            order_meta: {
                return_url: `${process.env.NEXTAUTH_URL}/profile?success=true&order_id={order_id}`
            }
        };

        const response = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': apiVersion
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree API Error:", data);
            throw new Error(data.message || "Failed to initiate Cashfree payment");
        }

        return {
            paymentSessionId: data.payment_session_id,
            orderId: data.order_id,
            isSandbox,
            type: 'cashfree'
        };

    } catch (error) {
        console.error("Cashfree Init Exception:", error);
        // Allow the configuration error to pass through to the UI
        if (error.message.includes("Configuration Error")) throw error;
        throw new Error(error.message || "Failed to initiate Cashfree payment");
    }
};