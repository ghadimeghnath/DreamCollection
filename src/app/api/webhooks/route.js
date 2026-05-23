import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/features/order/models/Order';
import Cart from '@/features/cart/models/Cart';
// ✅ Import User to ensure populate works
import User from '@/features/auth/models/User'; 
import { getStoreSettings } from '@/features/admin/settings/actions';
import { cancelOrderAndRestoreStock } from '@/features/order/actions';
// ✅ Import the new email function
import { sendOrderConfirmationEmail } from '@/lib/mail';

export async function POST(req) {
  const body = await req.text();
  const headerPayload = await headers(); 
  const signature = headerPayload.get('stripe-signature');
  const cashfreeSignature = headerPayload.get('x-webhook-signature');
  const cashfreeTimestamp = headerPayload.get('x-webhook-timestamp');

  try {
    await dbConnect();
    const settings = await getStoreSettings();
    const stripeConfig = settings.paymentGateways.find(g => g.id === 'stripe')?.config || {};
    const cashfreeConfig = settings.paymentGateways.find(g => g.id === 'cashfree')?.config || {};

    // --- STRIPE HANDLER ---
    if (signature) {
        if (!stripeConfig.secretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
        
        const stripe = new Stripe(stripeConfig.secretKey);
        let event;

        try {
            const webhookSecret = stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
            if (!webhookSecret) {
                console.error("Stripe Webhook Secret is missing.");
                return NextResponse.json({ error: "Configuration error: Webhook Secret missing" }, { status: 500 });
            }
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
            console.error("Webhook signature verification failed.", err.message);
            return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            if (orderId) {
                const order = await Order.findById(orderId);
                
                if (order && order.paymentStatus !== 'Paid') {
                    await Order.findByIdAndUpdate(orderId, { 
                        status: 'Processing', 
                        paymentStatus: 'Paid',
                        paymentMethod: 'stripe'
                    });
                    if (order.userId) {
                            await Cart.findOneAndUpdate(
                                { userId: order.userId },
                                { items: [], totalQuantity: 0, totalPrice: 0 }
                            );
                            console.log(`Cart cleared for user ${order.userId}`);
                        }
                    console.log(`Stripe Order ${orderId} marked as Paid.`);

                    // ✅ NEW: Send Confirmation Email
                    // Fetch order with user details to get email
                    const fullOrder = await Order.findById(orderId).populate('userId');
                    if (fullOrder && fullOrder.userId?.email) {
                        await sendOrderConfirmationEmail(fullOrder.userId.email, orderId, fullOrder.totalAmount);
                    }
                } else {
                    console.log(`Order ${orderId} was already paid. Skipping duplicate webhook.`);
                }
            }
        }
        else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            
            if (orderId) {
                console.log(`Payment failed for ${orderId}, restoring stock...`);
                await cancelOrderAndRestoreStock(orderId, "Payment Failed");
            }
        }
        return NextResponse.json({ received: true });
    }

    // --- CASHFREE HANDLER ---
    if (cashfreeSignature) {
        const secret = cashfreeConfig.secretKey;
        if (!secret) return NextResponse.json({ error: "No Cashfree secret found" }, { status: 500 });

        const dataToSign = cashfreeTimestamp + body;
        const generatedSignature = crypto.createHmac('sha256', secret).update(dataToSign).digest('base64');

        if (generatedSignature === cashfreeSignature) {
            const payload = JSON.parse(body);
            
            if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
                const orderId = payload.data.order.order_id;
                
                if (orderId) {
                     const order = await Order.findById(orderId);

                     if (order && order.paymentStatus !== 'Paid') {
                        await Order.findByIdAndUpdate(orderId, { 
                            status: 'Processing', 
                            paymentStatus: 'Paid',
                            paymentMethod: 'cashfree'
                        });
                        if (order.userId) {
                            await Cart.findOneAndUpdate(
                                { userId: order.userId },
                                { items: [], totalQuantity: 0, totalPrice: 0 }
                            );
                            console.log(`Cart cleared for user ${order.userId}`);
                        }
                        console.log(`Cashfree Order ${orderId} marked as Paid.`);

                        // ✅ NEW: Send Confirmation Email
                        const fullOrder = await Order.findById(orderId).populate('userId');
                        if (fullOrder && fullOrder.userId?.email) {
                            await sendOrderConfirmationEmail(fullOrder.userId.email, orderId, fullOrder.totalAmount);
                        }
                     } else {
                        console.log(`Order ${orderId} was already paid. Skipping duplicate webhook.`);
                     }
                }
            }
            else if (payload.type === "PAYMENT_FAILED_WEBHOOK" || payload.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
                 const orderId = payload.data.order.order_id;
                 if (orderId) {
                     console.log(`Cashfree payment failed for ${orderId}, restoring stock...`);
                     await cancelOrderAndRestoreStock(orderId, "Payment Failed/Dropped");
                 }
            }
            return NextResponse.json({ status: "ok" });
        } else {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    }

    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}