"use server";

import { db } from "@/lib/db";
import { wishlists, products, productVariants, productImages, categories, brands, genders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/actions";
import { eq, and, desc, inArray, sql } from "drizzle-orm";

export interface FavoriteProduct {
  id: string;
  product: {
    id: string;
    name: string;
    description: string | null;
    minPrice: number;
    maxPrice: number;
    images: Array<{
      id: string;
      url: string;
      isPrimary: boolean;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    brand: {
      id: string;
      name: string;
      slug: string;
    };
    gender: {
      id: string;
      label: string;
      slug: string;
    };
  };
  addedAt: Date;
}

export async function getFavorites(): Promise<FavoriteProduct[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  // Get wishlist items with basic product info
  const wishlistItems = await db
    .select({
      wishlistId: wishlists.id,
      addedAt: wishlists.addedAt,
      productId: products.id,
      productName: products.name,
      productDescription: products.description,
      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      genderId: genders.id,
      genderLabel: genders.label,
      genderSlug: genders.slug,
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(genders, eq(products.genderId, genders.id))
    .where(eq(wishlists.userId, user.id))
    .orderBy(desc(wishlists.addedAt));

  if (wishlistItems.length === 0) {
    return [];
  }

  const productIds = wishlistItems.map(item => item.productId);

  // Get prices for each product
  const priceData = await db
    .select({
      productId: productVariants.productId,
      minPrice: sql<string>`MIN(${productVariants.price})::text`,
      maxPrice: sql<string>`MAX(${productVariants.price})::text`,
    })
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds))
    .groupBy(productVariants.productId);

  const priceMap = new Map<string, { min: number; max: number }>();
  for (const price of priceData) {
    priceMap.set(price.productId, {
      min: parseFloat(price.minPrice),
      max: parseFloat(price.maxPrice),
    });
  }

  // Get images for each product
  const imagesData = await db
    .select({
      productId: productImages.productId,
      id: productImages.id,
      url: productImages.url,
      isPrimary: productImages.isPrimary,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(desc(productImages.isPrimary), productImages.sortOrder);

  const imagesMap = new Map<string, Array<{ id: string; url: string; isPrimary: boolean }>>();
  for (const img of imagesData) {
    const existing = imagesMap.get(img.productId) || [];
    existing.push({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary || false,
    });
    imagesMap.set(img.productId, existing);
  }

  // Build result
  return wishlistItems.map(item => {
    const prices = priceMap.get(item.productId) || { min: 0, max: 0 };
    const images = imagesMap.get(item.productId) || [];

    return {
      id: item.wishlistId,
      product: {
        id: item.productId,
        name: item.productName,
        description: item.productDescription,
        minPrice: prices.min,
        maxPrice: prices.max,
        images: images.slice(0, 5), // Limit to 5 images
        category: {
          id: item.categoryId,
          name: item.categoryName,
          slug: item.categorySlug,
        },
        brand: {
          id: item.brandId,
          name: item.brandName,
          slug: item.brandSlug,
        },
        gender: {
          id: item.genderId,
          label: item.genderLabel,
          slug: item.genderSlug,
        },
      },
      addedAt: item.addedAt,
    };
  });
}

export async function toggleFavorite(productId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You must be logged in to add favorites" };
  }

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, user.id),
          eq(wishlists.productId, productId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Remove from favorites
      await db
        .delete(wishlists)
        .where(eq(wishlists.id, existing[0].id));
      return { success: true, isFavorite: false };
    } else {
      // Add to favorites
      await db.insert(wishlists).values({
        userId: user.id,
        productId,
      });
      return { success: true, isFavorite: true };
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return { success: false, error: "Failed to update favorite" };
  }
}

export async function isFavorite(productId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  try {
    const existing = await db
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, user.id),
          eq(wishlists.productId, productId)
        )
      )
      .limit(1);

    return existing.length > 0;
  } catch {
    return false;
  }
}

