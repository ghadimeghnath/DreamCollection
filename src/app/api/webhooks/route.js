import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/features/order/models/Order';
import { getStoreSettings } from '@/features/admin/settings/actions';

export async function POST(req) {
  const body = await req.text();
  const headerPayload = await headers(); // Next.js 15+ Requirement (await headers)
  const signature = headerPayload.get('stripe-signature');
  const razorpaySignature = headerPayload.get('x-razorpay-signature');

  try {
    await dbConnect();
    const settings = await getStoreSettings();
    const stripeConfig = settings.paymentGateways.find(g => g.id === 'stripe')?.config || {};
    const razorpayConfig = settings.paymentGateways.find(g => g.id === 'razorpay')?.config || {};

    // --- STRIPE HANDLER ---
    if (signature) {
        if (!stripeConfig.secretKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
        
        const stripe = new Stripe(stripeConfig.secretKey);
        let event;

        try {
            const webhookSecret = stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
            if (webhookSecret) {
                // Secure verification
                event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            } else {
                 // Fallback for dev without secret (NOT SECURE for Prod)
                 event = JSON.parse(body);
            }
        } catch (err) {
            console.error("Webhook signature verification failed.", err.message);
            return NextResponse.json({ error: `Webhook signature verification failed.` }, { status: 400 });
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;

            if (orderId) {
                await Order.findByIdAndUpdate(orderId, { 
                    status: 'Processing', 
                    paymentStatus: 'Paid',
                    paymentMethod: 'stripe'
                });
            }
        }
        return NextResponse.json({ received: true });
    }

    // --- RAZORPAY HANDLER ---
    if (razorpaySignature) {
        const payload = JSON.parse(body);
        const secret = razorpayConfig.webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET; 
        
        if (!secret) return NextResponse.json({ error: "No Razorpay secret found" }, { status: 500 });

        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(body); // Use raw body for signature verification
        const digest = shasum.digest("hex");

        if (digest === razorpaySignature) {
            if (payload.event === "order.paid") {
                const orderId = payload.payload.payment.entity.notes.orderId || payload.payload.order.entity.receipt;
                if (orderId) {
                     await Order.findByIdAndUpdate(orderId, { 
                        status: 'Processing', 
                        paymentStatus: 'Paid',
                        paymentMethod: 'razorpay'
                    });
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