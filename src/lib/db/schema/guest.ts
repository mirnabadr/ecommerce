import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const guest = pgTable("guest", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // For auto-expiry
});

export type Guest = typeof guest.$inferSelect;
export type NewGuest = typeof guest.$inferInsert;

