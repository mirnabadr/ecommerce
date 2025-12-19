import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { z } from "zod";

export const genders = pgTable("genders", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(), // e.g., "Men"
  slug: text("slug").notNull().unique(), // e.g., "men"
});

// Relations are defined in filters-relations.ts to avoid circular dependencies

// Zod validation schemas
export const genderSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(50),
  slug: z.string().min(1).max(50),
});

export const insertGenderSchema = genderSchema.omit({ id: true });
export const selectGenderSchema = genderSchema;

export type Gender = z.infer<typeof selectGenderSchema>;
export type NewGender = z.infer<typeof insertGenderSchema>;

