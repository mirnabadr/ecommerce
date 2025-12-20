"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productImages,
  categories,
  brands,
  genders,
  colors,
  sizes,
} from "@/lib/db/schema";
import {
  eq,
  and,
  or,
  inArray,
  sql,
  gte,
  lte,
  ilike,
  desc,
  asc,
  isNull,
  isNotNull,
} from "drizzle-orm";

export interface ProductFilters {
  search?: string;
  gender?: string[];
  brand?: string[];
  category?: string[];
  color?: string[];
  size?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  minPrice: number;
  maxPrice: number;
  images: string[];
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
  createdAt: Date;
}

export interface GetAllProductsResult {
  products: ProductListItem[];
  totalCount: number;
}

/**
 * Get all products with filtering, search, sorting, and pagination
 * Optimized single-query implementation with proper joins
 */
export async function getAllProducts(
  params: ProductFilters = {}
): Promise<GetAllProductsResult> {
  const {
    search,
    gender,
    brand,
    category,
    color,
    size,
    priceMin,
    priceMax,
    sortBy = "latest",
    page = 1,
    limit = 20,
  } = params;

  // Build base conditions
  const conditions = [eq(products.isPublished, true)];

  // Search filter
  if (search && search.trim()) {
    conditions.push(
      or(
        ilike(products.name, `%${search.trim()}%`),
        ilike(products.description, `%${search.trim()}%`)
      )!
    );
  }

  // Gender filter
  if (gender && gender.length > 0) {
    const genderRecords = await db
      .select({ id: genders.id })
      .from(genders)
      .where(inArray(genders.slug, gender));
    
    if (genderRecords.length > 0) {
      conditions.push(inArray(products.genderId, genderRecords.map((g) => g.id)));
    } else {
      // No matching genders, return empty result
      return { products: [], totalCount: 0 };
    }
  }

  // Brand filter
  if (brand && brand.length > 0) {
    const brandRecords = await db
      .select({ id: brands.id })
      .from(brands)
      .where(inArray(brands.slug, brand));
    
    if (brandRecords.length > 0) {
      conditions.push(inArray(products.brandId, brandRecords.map((b) => b.id)));
    } else {
      return { products: [], totalCount: 0 };
    }
  }

  // Category filter
  if (category && category.length > 0) {
    const categoryRecords = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.slug, category));
    
    if (categoryRecords.length > 0) {
      conditions.push(inArray(products.categoryId, categoryRecords.map((c) => c.id)));
    } else {
      return { products: [], totalCount: 0 };
    }
  }

  // Color filter - we'll handle this in the variant join
  let colorIds: string[] | null = null;
  if (color && color.length > 0) {
    const colorRecords = await db
      .select({ id: colors.id })
      .from(colors)
      .where(inArray(colors.slug, color));
    
    if (colorRecords.length > 0) {
      colorIds = colorRecords.map((c) => c.id);
    } else {
      return { products: [], totalCount: 0 };
    }
  }

  // Size filter - we'll handle this in the variant join
  let sizeIds: string[] | null = null;
  if (size && size.length > 0) {
    const sizeRecords = await db
      .select({ id: sizes.id })
      .from(sizes)
      .where(inArray(sizes.slug, size));
    
    if (sizeRecords.length > 0) {
      sizeIds = sizeRecords.map((s) => s.id);
    } else {
      return { products: [], totalCount: 0 };
    }
  }

  // Build variant conditions for color, size, and price filters
  const variantConditions: ReturnType<typeof and>[] = [];
  if (colorIds && colorIds.length > 0) {
    variantConditions.push(inArray(productVariants.colorId, colorIds));
  }
  if (sizeIds && sizeIds.length > 0) {
    variantConditions.push(inArray(productVariants.sizeId, sizeIds));
  }
  if (priceMin !== undefined || priceMax !== undefined) {
    const priceConditions: ReturnType<typeof and>[] = [];
    if (priceMin !== undefined) {
      priceConditions.push(gte(productVariants.price, priceMin.toString()));
    }
    if (priceMax !== undefined) {
      priceConditions.push(lte(productVariants.price, priceMax.toString()));
    }
    if (priceConditions.length > 0) {
      variantConditions.push(and(...priceConditions)!);
    }
  }

  // If we have variant filters, we need to filter products by those that have matching variants
  if (variantConditions.length > 0) {
    const matchingProductIds = await db
      .selectDistinct({ productId: productVariants.productId })
      .from(productVariants)
      .where(and(...variantConditions)!);
    
    const productIdSet = new Set(matchingProductIds.map((p) => p.productId));
    if (productIdSet.size === 0) {
      return { products: [], totalCount: 0 };
    }
    conditions.push(inArray(products.id, Array.from(productIdSet)));
  }

  // Get total count (before pagination)
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(and(...conditions)!);
  
  const totalCount = totalCountResult[0]?.count || 0;

  // Build main query with aggregations
  // We'll get min/max prices and images in subqueries to avoid N+1
  const baseQuery = db
    .select({
      product: products,
      category: categories,
      brand: brands,
      gender: genders,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(genders, eq(products.genderId, genders.id))
    .where(and(...conditions)!);

  // Apply sorting
  let sortedQuery = baseQuery;
  switch (sortBy) {
    case "price_asc":
      // We'll need to join with variants for price sorting
      sortedQuery = db
        .select({
          product: products,
          category: categories,
          brand: brands,
          gender: genders,
          minPrice: sql<string>`MIN(${productVariants.price})::text`,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .innerJoin(brands, eq(products.brandId, brands.id))
        .innerJoin(genders, eq(products.genderId, genders.id))
        .innerJoin(productVariants, eq(products.id, productVariants.productId))
        .where(and(...conditions)!)
        .groupBy(products.id, categories.id, brands.id, genders.id)
        .orderBy(asc(sql`MIN(${productVariants.price})`));
      break;
    case "price_desc":
      sortedQuery = db
        .select({
          product: products,
          category: categories,
          brand: brands,
          gender: genders,
          maxPrice: sql<string>`MAX(${productVariants.price})::text`,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .innerJoin(brands, eq(products.brandId, brands.id))
        .innerJoin(genders, eq(products.genderId, genders.id))
        .innerJoin(productVariants, eq(products.id, productVariants.productId))
        .where(and(...conditions)!)
        .groupBy(products.id, categories.id, brands.id, genders.id)
        .orderBy(desc(sql`MAX(${productVariants.price})`));
      break;
    case "latest":
    default:
      sortedQuery = baseQuery.orderBy(desc(products.createdAt));
      break;
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  const paginatedQuery = sortedQuery.limit(limit).offset(offset);

  const results = await paginatedQuery;

  // Get product IDs for fetching variants and images
  const productIds = results.map((r) => r.product.id);

  if (productIds.length === 0) {
    return { products: [], totalCount };
  }

  // Get price aggregations for all products
  const priceAggregations = await db
    .select({
      productId: productVariants.productId,
      minPrice: sql<string>`MIN(${productVariants.price})::text`,
      maxPrice: sql<string>`MAX(${productVariants.price})::text`,
    })
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds))
    .groupBy(productVariants.productId);

  const priceMap = new Map<string, { min: number; max: number }>(
    priceAggregations.map((p) => [
      p.productId,
      {
        min: parseFloat(p.minPrice),
        max: parseFloat(p.maxPrice),
      },
    ])
  );

  // Get images for products
  // If color filter is applied, get color-specific images; otherwise get generic images
  let imageQuery = db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      sortOrder: productImages.sortOrder,
      isPrimary: productImages.isPrimary,
      variantId: productImages.variantId,
    })
    .from(productImages)
    .where(inArray(productImages.productId, productIds));

  // If color filter is applied, prioritize color-specific images
  if (colorIds && colorIds.length > 0) {
    // Get color-specific images first
    const colorSpecificImages = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        sortOrder: productImages.sortOrder,
        isPrimary: productImages.isPrimary,
        variantId: productImages.variantId,
        colorId: productVariants.colorId,
      })
      .from(productImages)
      .innerJoin(
        productVariants,
        eq(productImages.variantId, productVariants.id)
      )
      .where(
        and(
          inArray(productImages.productId, productIds),
          inArray(productVariants.colorId, colorIds),
          isNotNull(productImages.variantId)
        )!
      )
      .orderBy(
        desc(productImages.isPrimary),
        asc(productImages.sortOrder)
      );

    // Get generic images (product-level, no variant) for products without color-specific images
    const productsWithColorImages = new Set(
      colorSpecificImages.map((img) => img.productId)
    );
    const productsNeedingGenericImages = productIds.filter(
      (id) => !productsWithColorImages.has(id)
    );

    let genericImages: typeof colorSpecificImages = [];
    if (productsNeedingGenericImages.length > 0) {
      const genericImagesResult = await db
        .select({
          productId: productImages.productId,
          url: productImages.url,
          sortOrder: productImages.sortOrder,
          isPrimary: productImages.isPrimary,
          variantId: productImages.variantId,
        })
        .from(productImages)
        .where(
          and(
            inArray(productImages.productId, productsNeedingGenericImages),
            isNull(productImages.variantId)
          )!
        )
        .orderBy(
          desc(productImages.isPrimary),
          asc(productImages.sortOrder)
        );

      genericImages = genericImagesResult.map((img) => ({
        ...img,
        colorId: null,
      }));
    }

    // Combine and group by product
    const allImages = [...colorSpecificImages, ...genericImages];
    const imageMap = new Map<string, typeof colorSpecificImages>();
    for (const img of allImages) {
      const existing = imageMap.get(img.productId) || [];
      existing.push(img);
      imageMap.set(img.productId, existing);
    }

    // Build final product list
    const productList: ProductListItem[] = results.map((r) => {
      const prices = priceMap.get(r.product.id) || { min: 0, max: 0 };
      const images = (imageMap.get(r.product.id) || [])
        .slice(0, 5) // Limit to top 5 images
        .map((img) => img.url);

      return {
        id: r.product.id,
        name: r.product.name,
        description: r.product.description,
        minPrice: prices.min,
        maxPrice: prices.max,
        images: images.length > 0 ? images : ["/shoes/shoe-1.jpg"], // Fallback image
        category: {
          id: r.category.id,
          name: r.category.name,
          slug: r.category.slug,
        },
        brand: {
          id: r.brand.id,
          name: r.brand.name,
          slug: r.brand.slug,
        },
        gender: {
          id: r.gender.id,
          label: r.gender.label,
          slug: r.gender.slug,
        },
        createdAt: r.product.createdAt,
      };
    });

    return { products: productList, totalCount };
  } else {
    // No color filter - get all images (prioritize primary, then by sort order)
    // Prefer variant-specific images, but also include generic images
    const allImages = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        sortOrder: productImages.sortOrder,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(
        desc(productImages.isPrimary),
        asc(productImages.sortOrder)
      );

    // Group images by product
    const imageMap = new Map<string, string[]>();
    for (const img of allImages) {
      const existing = imageMap.get(img.productId) || [];
      existing.push(img.url);
      imageMap.set(img.productId, existing);
    }

    // Build final product list
    const productList: ProductListItem[] = results.map((r) => {
      const prices = priceMap.get(r.product.id) || { min: 0, max: 0 };
      const images = (imageMap.get(r.product.id) || []).slice(0, 5);

      return {
        id: r.product.id,
        name: r.product.name,
        description: r.product.description,
        minPrice: prices.min,
        maxPrice: prices.max,
        images: images.length > 0 ? images : ["/shoes/shoe-1.jpg"],
        category: {
          id: r.category.id,
          name: r.category.name,
          slug: r.category.slug,
        },
        brand: {
          id: r.brand.id,
          name: r.brand.name,
          slug: r.brand.slug,
        },
        gender: {
          id: r.gender.id,
          label: r.gender.label,
          slug: r.gender.slug,
        },
        createdAt: r.product.createdAt,
      };
    });

    return { products: productList, totalCount };
  }
}

export interface ProductVariantDetail {
  id: string;
  sku: string;
  price: number;
  salePrice: number | null;
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
    sortOrder: number;
  };
  inStock: number;
  weight: number | null;
  dimensions: Record<string, number> | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  gender: {
    id: string;
    label: string;
    slug: string;
  };
  variants: ProductVariantDetail[];
  images: Array<{
    id: string;
    url: string;
    sortOrder: number;
    isPrimary: boolean;
    variantId: string | null;
  }>;
  minPrice: number;
  maxPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get a single product with all details including variants, images, and relations
 * Optimized single-query implementation
 */
export async function getProduct(productId: string): Promise<ProductDetail | null> {
  // Get product with relations
  const productResult = await db
    .select({
      product: products,
      category: categories,
      brand: brands,
      gender: genders,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(genders, eq(products.genderId, genders.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (productResult.length === 0) {
    return null;
  }

  const { product, category, brand, gender } = productResult[0];

  // Get all variants with color and size
  const variantsResult = await db
    .select({
      variant: productVariants,
      color: colors,
      size: sizes,
    })
    .from(productVariants)
    .innerJoin(colors, eq(productVariants.colorId, colors.id))
    .innerJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .where(eq(productVariants.productId, productId))
    .orderBy(productVariants.createdAt);

  // Get all images
  const imagesResult = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.isPrimary, productImages.sortOrder);

  // Calculate min/max prices
  const prices = variantsResult.reduce(
    (acc, v) => {
      const price = parseFloat(v.variant.price);
      const salePrice = v.variant.salePrice
        ? parseFloat(v.variant.salePrice)
        : null;
      const effectivePrice = salePrice || price;
      return {
        min: Math.min(acc.min, effectivePrice),
        max: Math.max(acc.max, effectivePrice),
      };
    },
    { min: Infinity, max: -Infinity }
  );

  const productDetail: ProductDetail = {
    id: product.id,
    name: product.name,
    description: product.description,
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
    },
    brand: {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl,
    },
    gender: {
      id: gender.id,
      label: gender.label,
      slug: gender.slug,
    },
    variants: variantsResult.map((v) => ({
      id: v.variant.id,
      sku: v.variant.sku,
      price: parseFloat(v.variant.price),
      salePrice: v.variant.salePrice ? parseFloat(v.variant.salePrice) : null,
      color: {
        id: v.color.id,
        name: v.color.name,
        slug: v.color.slug,
        hexCode: v.color.hexCode,
      },
      size: {
        id: v.size.id,
        name: v.size.name,
        slug: v.size.slug,
        sortOrder: v.size.sortOrder,
      },
      inStock: v.variant.inStock,
      weight: v.variant.weight,
      dimensions: v.variant.dimensions as Record<string, number> | null,
    })),
    images: imagesResult.map((img) => ({
      id: img.id,
      url: img.url,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
      variantId: img.variantId,
    })),
    minPrice: prices.min === Infinity ? 0 : prices.min,
    maxPrice: prices.max === -Infinity ? 0 : prices.max,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  return productDetail;
}

