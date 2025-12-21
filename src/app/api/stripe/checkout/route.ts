import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCartItems, clearCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { generateOrderNumber } from "@/lib/actions/orders";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cart items
    const cartItems = await getCartItems();
    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.productVariant.salePrice || item.productVariant.price);
      return sum + price * item.quantity;
    }, 0);

    // Create order in database with PENDING status
    const orderNumber = await generateOrderNumber();
    const [order] = await db
      .insert(orders)
      .values({
        userId: user.id,
        orderNumber,
        status: "pending",
        totalAmount: total.toFixed(2),
        // Addresses can be null for now - will be collected in Stripe checkout
      })
      .returning();

    // Create order items
    for (const cartItem of cartItems) {
      const price = parseFloat(cartItem.productVariant.salePrice || cartItem.productVariant.price);
      await db.insert(orderItems).values({
        orderId: order.id,
        productVariantId: cartItem.productVariant.id,
        quantity: cartItem.quantity,
        price: price.toFixed(2),
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => {
        const price = parseFloat(item.productVariant.salePrice || item.productVariant.price);
        const primaryImage = item.productVariant.product.images.find(img => img.isPrimary) || item.productVariant.product.images[0];
        const imageUrl = primaryImage?.url || "";
        const fullImageUrl = imageUrl.startsWith("http") 
          ? imageUrl 
          : `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${imageUrl}`;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.productVariant.product.name,
              description: `${item.productVariant.color.name} • Size ${item.productVariant.size.name}`,
              images: fullImageUrl ? [fullImageUrl] : [],
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders/cancel`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
    });

    // Update order with Stripe session ID
    await db
      .update(orders)
      .set({ stripeSessionId: session.id })
      .where(eq(orders.id, order.id));

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

