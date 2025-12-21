"use server";

import { db } from "@/lib/db";
import { carts, cartItems, products, productVariants, productImages, colors, sizes } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/actions";
import { eq, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { guest } from "@/lib/db/schema";

export interface CartItemWithProduct {
  id: string;
  quantity: number;
  productVariant: {
    id: string;
    price: string;
    salePrice: string | null;
    color: {
      id: string;
      name: string;
      slug: string;
      hexCode: string;
    };
    size: {
      id: string;
      name: string;
      slug: string;
    };
    product: {
      id: string;
      name: string;
      images: Array<{
        id: string;
        url: string;
        isPrimary: boolean;
      }>;
    };
  };
}

async function getOrCreateCart() {
  const user = await getCurrentUser();
  
  if (user) {
    // Get or create user cart
    let cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    if (cart.length === 0) {
      const [newCart] = await db
        .insert(carts)
        .values({ userId: user.id })
        .returning();
      return newCart;
    }
    return cart[0];
  } else {
    // Guest cart
    const cookieStore = await cookies();
    const guestToken = cookieStore.get("guest_session")?.value;
    
    if (!guestToken) {
      throw new Error("Guest session not found");
    }

    let cart = await db
      .select()
      .from(carts)
      .where(eq(carts.guestId, guestToken))
      .limit(1);

    if (cart.length === 0) {
      const [newCart] = await db
        .insert(carts)
        .values({ guestId: guestToken })
        .returning();
      return newCart;
    }
    return cart[0];
  }
}

export async function getCartItems(): Promise<CartItemWithProduct[]> {
  const cart = await getOrCreateCart();
  
  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      variantId: productVariants.id,
      variantPrice: productVariants.price,
      variantSalePrice: productVariants.salePrice,
      colorId: colors.id,
      colorName: colors.name,
      colorSlug: colors.slug,
      colorHex: colors.hexCode,
      sizeId: sizes.id,
      sizeName: sizes.name,
      sizeSlug: sizes.slug,
      productId: products.id,
      productName: products.name,
      imageId: productImages.id,
      imageUrl: productImages.url,
      imageIsPrimary: productImages.isPrimary,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
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
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(desc(cartItems.id));

  // Group by cart item and collect images
  const grouped = new Map<string, CartItemWithProduct>();
  
  for (const item of items) {
    if (!grouped.has(item.id)) {
      grouped.set(item.id, {
        id: item.id,
        quantity: item.quantity,
        productVariant: {
          id: item.variantId,
          price: item.variantPrice,
          salePrice: item.variantSalePrice,
          color: {
            id: item.colorId,
            name: item.colorName,
            slug: item.colorSlug,
            hexCode: item.colorHex,
          },
          size: {
            id: item.sizeId,
            name: item.sizeName,
            slug: item.sizeSlug,
          },
          product: {
            id: item.productId,
            name: item.productName,
            images: [],
          },
        },
      });
    }
    
    if (item.imageId && item.imageUrl) {
      const existing = grouped.get(item.id)!;
      if (!existing.productVariant.product.images.find(img => img.id === item.imageId)) {
        existing.productVariant.product.images.push({
          id: item.imageId,
          url: item.imageUrl,
          isPrimary: item.imageIsPrimary || false,
        });
      }
    }
  }

  return Array.from(grouped.values());
}

export async function getCartCount(): Promise<number> {
  try {
    const items = await getCartItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  } catch {
    return 0;
  }
}

export async function addToCart(productIdOrVariantId: string, quantity: number = 1) {
  try {
    const cart = await getOrCreateCart();
    
    // Check if it's a variant ID (UUID format) or product ID
    // If it's a product ID, get the first variant
    let variantId = productIdOrVariantId;
    
    // Try to find if it's a product ID by checking if it exists in products table
    const productCheck = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productIdOrVariantId))
      .limit(1);
    
    if (productCheck.length > 0) {
      // It's a product ID, get first variant
      const firstVariant = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.productId, productIdOrVariantId))
        .limit(1);
      
      if (firstVariant.length === 0) {
        return { success: false, error: "No variants available for this product" };
      }
      
      variantId = firstVariant[0].id;
    }
    
    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productVariantId, variantId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id));
    } else {
      // Add new item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productVariantId: variantId,
        quantity,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return { success: true };
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId));

    return { success: true };
  } catch (error) {
    console.error("Update cart item error:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

export async function clearCart() {
  try {
    const cart = await getOrCreateCart();
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

