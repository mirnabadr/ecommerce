import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core";
import { z } from "zod";

export const sizes = pgTable("sizes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "M"
  slug: text("slug").notNull().unique(), // e.g., "m"
  sortOrder: integer("sort_order").notNull().default(0), // for ordering: S < M < L
});

// Relations are defined in filters-relations.ts to avoid circular dependencies

// Zod validation schemas
export const sizeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(10),
  slug: z.string().min(1).max(10),
  sortOrder: z.number().int().min(0),
});

export const insertSizeSchema = sizeSchema.omit({ id: true });
export const selectSizeSchema = sizeSchema;

export type Size = z.infer<typeof selectSizeSchema>;
export type NewSize = z.infer<typeof insertSizeSchema>;

