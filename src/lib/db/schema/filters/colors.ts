import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const colors = pgTable("colors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g., "Red"
  slug: text("slug").notNull().unique(), // e.g., "red"
  hexCode: text("hex_code").notNull(), // e.g., "#FF0000"
});

// Relations are defined in filters-relations.ts to avoid circular dependencies

// Zod validation schemas
export const colorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color code"),
});

export const insertColorSchema = colorSchema.omit({ id: true });
export const selectColorSchema = colorSchema;

export type Color = z.infer<typeof selectColorSchema>;
export type NewColor = z.infer<typeof insertColorSchema>;

