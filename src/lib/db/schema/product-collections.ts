import { pgTable, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { products } from "./products";
import { collections } from "./collections";

export const productCollections = pgTable("product_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
});

export const productCollectionsRelations = relations(productCollections, ({ one }) => ({
  product: one(products, {
    fields: [productCollections.productId],
    references: [products.id],
  }),
  collection: one(collections, {
    fields: [productCollections.collectionId],
    references: [collections.id],
  }),
}));

// Zod validation schemas
export const productCollectionSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  collectionId: z.string().uuid(),
});

export const insertProductCollectionSchema = productCollectionSchema.omit({ id: true });
export const selectProductCollectionSchema = productCollectionSchema;

export type ProductCollection = z.infer<typeof selectProductCollectionSchema>;
export type NewProductCollection = z.infer<typeof insertProductCollectionSchema>;

