import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const properties = sqliteTable("properties", {
  id: text("id").primaryKey(),
  source: text("source").notNull(), 
  sourceName: text("source_name").notNull(), 
  url: text("url").notNull(),
  title: text("title").notNull(),
  district: text("district").notNull(), 
  municipality: text("municipality").notNull(), 
  type: text("type").notNull(), 
  price: real("price").notNull(),
  marketValue: real("market_value"),
  discountPct: real("discount_pct"),
  score: integer("score"),
  rentability: real("rentability"),
  images: text("images"), 
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").$type<"free" | "pro">().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status"),
});
