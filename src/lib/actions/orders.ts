"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products, productVariants, productImages, colors, sizes, categories, brands, genders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/actions";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: string;
    product: {
      id: string;
      name: string;
      image: string | null;
    };
    variant: {
      color: {
        name: string;
      };
      size: {
        name: string;
      };
    };
  }>;
}

export async function getOrders(): Promise<OrderWithItems[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  const userOrders = await db
    .select({
      order: orders,
    })
    .from(orders)
    .where(eq(orders.userId, user.id))
    .orderBy(desc(orders.createdAt));

  const orderIds = userOrders.map(o => o.order.id);

  if (orderIds.length === 0) {
    return [];
  }

  // Get order items with product details
  const items = await db
    .select({
      orderItem: orderItems,
      product: products,
      variant: productVariants,
      color: colors,
      size: sizes,
      image: productImages,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(colors, eq(productVariants.colorId, colors.id))
    .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isPrimary, true)
      )
    )
    .where(inArray(orderItems.orderId, orderIds));

  // Group items by order
  const ordersMap = new Map<string, OrderWithItems>();

  for (const order of userOrders) {
    ordersMap.set(order.order.id, {
      id: order.order.id,
      orderNumber: order.order.orderNumber,
      status: order.order.status as any,
      totalAmount: order.order.totalAmount,
      createdAt: order.order.createdAt,
      updatedAt: order.order.updatedAt,
      items: [],
    });
  }

  // Add items to orders
  for (const item of items) {
    const order = ordersMap.get(item.orderItem.orderId);
    if (order) {
      order.items.push({
        id: item.orderItem.id,
        quantity: item.orderItem.quantity,
        price: item.orderItem.price,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.image?.url || null,
        },
        variant: {
          color: {
            name: item.color.name,
          },
          size: {
            name: item.size.name,
          },
        },
      });
    }
  }

  return Array.from(ordersMap.values());
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.userId, user.id)
      )
    )
    .limit(1);

  if (!order) {
    return null;
  }

  // Get order items
  const items = await db
    .select({
      orderItem: orderItems,
      product: products,
      variant: productVariants,
      color: colors,
      size: sizes,
      image: productImages,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(colors, eq(productVariants.colorId, colors.id))
    .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isPrimary, true)
      )
    )
    .where(eq(orderItems.orderId, orderId));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status as any,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: items.map(item => ({
      id: item.orderItem.id,
      quantity: item.orderItem.quantity,
      price: item.orderItem.price,
      product: {
        id: item.product.id,
        name: item.product.name,
        image: item.image?.url || null,
      },
      variant: {
        color: {
          name: item.color.name,
        },
        size: {
          name: item.size.name,
        },
      },
    })),
  };
}

export async function cancelOrder(orderId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, user.id)
        )
      )
      .limit(1);

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Only allow cancellation if order is pending or processing
    if (order.status === "delivered" || order.status === "cancelled") {
      return { success: false, error: "Cannot cancel this order" };
    }

    await db
      .update(orders)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return { success: true };
  } catch (error) {
    console.error("Cancel order error:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}

export async function generateOrderNumber(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

