import { pgTable, uuid, text, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { user } from "./user";

export const addressTypeEnum = ["billing", "shipping"] as const;

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type", { enum: addressTypeEnum }).notNull(), // 'billing' or 'shipping'
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  postalCode: text("postal_code").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(user, {
    fields: [addresses.userId],
    references: [user.id],
  }),
}));

// Zod validation schemas
export const addressTypeSchema = z.enum(addressTypeEnum);

export const addressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: addressTypeSchema,
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  isDefault: z.boolean(),
});

export const insertAddressSchema = addressSchema.omit({ id: true });
export const selectAddressSchema = addressSchema;

export type Address = z.infer<typeof selectAddressSchema>;
export type NewAddress = z.infer<typeof insertAddressSchema>;

