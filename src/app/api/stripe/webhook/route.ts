import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { orders, cartItems, carts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      // Find order by Stripe session ID
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.stripeSessionId, session.id))
        .limit(1);

      if (!order) {
        console.error("Order not found for session:", session.id);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Check if already processed (idempotency)
      if (order.status === "delivered" || order.status === "processing") {
        console.log("Order already processed:", order.id);
        return NextResponse.json({ received: true });
      }

      // Update order status to processing (will be delivered later)
      await db
        .update(orders)
        .set({ 
          status: "processing",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      // Clear user's cart
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, order.userId))
        .limit(1);

      if (userCart.length > 0) {
        await db
          .delete(cartItems)
          .where(eq(cartItems.cartId, userCart[0].id));
      }

      console.log("Order processed successfully:", order.id);
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: error.message || "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

