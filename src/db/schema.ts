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
  lat: real("lat"),
  lng: real("lng"),
  geoQuality: text("geo_quality").$type<"exact" | "street" | "parish" | "district" | "NA">(),
  dedupHash: text("dedup_hash"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  lastChecked: integer("last_checked", { mode: "timestamp" }),
  checkStatus: text("check_status").$type<"ok" | "not_found" | "error" | "pending">().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  plan: text("plan").$type<"free" | "pro">().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status"),
});

export const searchAlerts = sqliteTable("search_alerts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  district: text("district"),
  maxPrice: real("max_price"),
  minScore: integer("min_score"),
  propertyType: text("property_type"),
  email: text("email").notNull(),
  active: integer("active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const priceHistory = sqliteTable("price_history", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  price: real("price").notNull(),
  marketValue: real("market_value"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const savedProperties = sqliteTable("saved_properties", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  propertyId: text("property_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
