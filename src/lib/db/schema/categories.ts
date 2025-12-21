import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";

const categoriesTable = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: uuid("parent_id").references((): any => categoriesTable.id, { onDelete: "cascade" }), // nullable for hierarchical structure
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const categories = categoriesTable;

// Relations are defined separately to avoid circular dependencies
export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  parent: one(categoriesTable, {
    fields: [categoriesTable.parentId],
    references: [categoriesTable.id],
  }),
  children: many(categoriesTable),
  // products relation is defined in products-relations.ts to avoid circular dependency
}));

// Zod validation schemas
export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  parentId: z.string().uuid().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCategorySchema = categorySchema.omit({ id: true, createdAt: true, updatedAt: true });
export const selectCategorySchema = categorySchema;

export type Category = z.infer<typeof selectCategorySchema>;
export type NewCategory = z.infer<typeof insertCategorySchema>;

