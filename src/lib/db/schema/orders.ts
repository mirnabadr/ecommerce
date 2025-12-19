import { pgTable, uuid, text, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { user } from "./user";
import { addresses } from "./addresses";
import { orderItems } from "./order-items";

export const orderStatusEnum = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status", { enum: orderStatusEnum }).notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddressId: uuid("shipping_address_id").notNull().references(() => addresses.id, { onDelete: "restrict" }),
  billingAddressId: uuid("billing_address_id").notNull().references(() => addresses.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  shippingAddress: one(addresses, {
    fields: [orders.shippingAddressId],
    references: [addresses.id],
  }),
  billingAddress: one(addresses, {
    fields: [orders.billingAddressId],
    references: [addresses.id],
  }),
  orderItems: many(orderItems),
}));

// Zod validation schemas
export const orderStatusSchema = z.enum(orderStatusEnum);

export const orderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  orderNumber: z.string().min(1),
  status: orderStatusSchema,
  totalAmount: z.string().regex(/^\d+\.\d{2}$/, "Total amount must be in format 0.00"),
  shippingAddressId: z.string().uuid(),
  billingAddressId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const selectOrderSchema = orderSchema;

export type Order = z.infer<typeof selectOrderSchema>;
export type NewOrder = z.infer<typeof insertOrderSchema>;

