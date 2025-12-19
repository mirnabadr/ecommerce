import { pgTable, uuid, text, numeric, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { products } from "./products";
import { colors } from "./filters/colors";
import { sizes } from "./filters/sizes";
import { productImages } from "./product-images";
import { cartItems } from "./cart-items";

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  colorId: uuid("color_id").notNull().references(() => colors.id, { onDelete: "restrict" }),
  sizeId: uuid("size_id").notNull().references(() => sizes.id, { onDelete: "restrict" }),
  inStock: integer("in_stock").notNull().default(0),
  weight: real("weight"), // in kg or lbs
  dimensions: jsonb("dimensions"), // { length, width, height }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  color: one(colors, {
    fields: [productVariants.colorId],
    references: [colors.id],
  }),
  size: one(sizes, {
    fields: [productVariants.sizeId],
    references: [sizes.id],
  }),
  images: many(productImages),
  cartItems: many(cartItems),
}));

// Zod validation schemas
const dimensionsSchema = z.object({
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const productVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sku: z.string().min(1).max(100),
  price: z.string().regex(/^\d+\.\d{2}$/, "Price must be in format 0.00"),
  salePrice: z.string().regex(/^\d+\.\d{2}$/, "Sale price must be in format 0.00").nullable().optional(),
  colorId: z.string().uuid(),
  sizeId: z.string().uuid(),
  inStock: z.number().int().min(0),
  weight: z.number().positive().nullable().optional(),
  dimensions: dimensionsSchema.nullable().optional(),
  createdAt: z.date(),
});

export const insertProductVariantSchema = productVariantSchema.omit({ id: true, createdAt: true });
export const selectProductVariantSchema = productVariantSchema;

export type ProductVariant = z.infer<typeof selectProductVariantSchema>;
export type NewProductVariant = z.infer<typeof insertProductVariantSchema>;

