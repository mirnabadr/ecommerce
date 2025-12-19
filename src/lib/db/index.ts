import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as productSchema from "./schema";
import * as authSchema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
// Combine all schemas
export const db = drizzle(sql, { 
  schema: { ...productSchema, ...authSchema } 
});

