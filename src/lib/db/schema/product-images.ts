import { pgTable, uuid, text, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { products } from "./products";
import { productVariants } from "./variants";

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0), // for gallery ordering
  isPrimary: boolean("is_primary").notNull().default(false),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

// Zod validation schemas
export const productImageSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  url: z.string().min(1), // Accept relative paths like /shoes/shoe-1.jpg
  sortOrder: z.number().int().min(0),
  isPrimary: z.boolean(),
});

export const insertProductImageSchema = productImageSchema.omit({ id: true });
export const selectProductImageSchema = productImageSchema;

export type ProductImage = z.infer<typeof selectProductImageSchema>;
export type NewProductImage = z.infer<typeof insertProductImageSchema>;

