import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { user } from "./user";
import { guest } from "./guest";
import { cartItems } from "./cart-items";

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }), // for guests: null
  guestId: text("guest_id").references(() => guest.sessionToken, { onDelete: "cascade" }), // for guests
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(user, {
    fields: [carts.userId],
    references: [user.id],
  }),
  items: many(cartItems),
}));

// Zod validation schemas
export const cartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  guestId: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertCartSchema = cartSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const selectCartSchema = cartSchema;

export type Cart = z.infer<typeof selectCartSchema>;
export type NewCart = z.infer<typeof insertCartSchema>;

