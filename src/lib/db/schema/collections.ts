import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { productCollections } from "./product-collections";

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Summer '25"
  slug: text("slug").notNull().unique(), // e.g., "summer-25"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  productCollections: many(productCollections),
}));

// Zod validation schemas
export const collectionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  createdAt: z.date(),
});

export const insertCollectionSchema = collectionSchema.omit({ id: true, createdAt: true });
export const selectCollectionSchema = collectionSchema;

export type Collection = z.infer<typeof selectCollectionSchema>;
export type NewCollection = z.infer<typeof insertCollectionSchema>;

