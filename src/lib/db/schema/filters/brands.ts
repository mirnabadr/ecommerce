import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Nike", "Adidas"
  slug: text("slug").notNull().unique(), // e.g., "nike"
  logoUrl: text("logo_url"), // optional
});

// Relations are defined in filters-relations.ts to avoid circular dependencies

// Zod validation schemas
export const brandSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  logoUrl: z.string().url().nullable().optional(),
});

export const insertBrandSchema = brandSchema.omit({ id: true });
export const selectBrandSchema = brandSchema;

export type Brand = z.infer<typeof selectBrandSchema>;
export type NewBrand = z.infer<typeof insertBrandSchema>;

