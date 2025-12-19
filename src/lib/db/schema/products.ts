import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { categories } from "./categories";
import { genders } from "./filters/genders";
import { brands } from "./filters/brands";
import { reviews } from "./reviews";
import { wishlists } from "./wishlists";
import { productCollections } from "./product-collections";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: uuid("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  genderId: uuid("gender_id").notNull().references(() => genders.id, { onDelete: "restrict" }),
  brandId: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "restrict" }),
  isPublished: boolean("is_published").notNull().default(false),
  defaultVariantId: uuid("default_variant_id"), // References product_variants.id
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations are defined in products-relations.ts to avoid circular dependencies

// Zod validation schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  genderId: z.string().uuid(),
  brandId: z.string().uuid(),
  isPublished: z.boolean(),
  defaultVariantId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const selectProductSchema = productSchema;

export type Product = z.infer<typeof selectProductSchema>;
export type NewProduct = z.infer<typeof insertProductSchema>;
