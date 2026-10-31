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
  /**
   * Preço de venda.
   *
   * - fixed_price: é o asking_price publicado pelo anunciante.
   * - auction_*: é o current_bid (lance atual). Pode ser muito inferior ao max_bid
   *   (ex.: vendas da AT começam a 2-5% do valor avaliado).
   *
   * Para leilões, o yield e o score usam max_bid (custo real de arrematação),
   * NÃO este campo. Ver src/lib/valuation/score.ts, ramo listing_type === 'auction'.
   *
   * Inconsistência conhecida: currentBid está null para a maioria dos leilões
   * (o scraper usa price); max_bid é o campo canónico para leilões.
   */
  price: real("price").notNull(),
  marketValue: real("market_value"),
  discountPct: real("discount_pct"),
  score: integer("score"),
  rentability: real("rentability"),
  images: text("images"), 
  image_url: text("image_url"),
  image_source: text("image_source").$type<"og_image" | "gallery_first" | "portal_thumbnail" | "missing">(),
  image_status: text("image_status").$type<"real" | "missing" | "broken">().default("missing"),
  isAuction: integer("is_auction", { mode: "boolean" }).default(false),
  auctionType: text("auction_type").$type<"judicial" | "fiscal" | "private" | null>(),
  auctionHouse: text("auction_house"), // e-Leilões, Leilosoc, Martelo.pt, Estamo, etc.
  currentBid: real("current_bid"), // Lance atual
  reservePrice: real("reserve_price"), // Preço de reserva se conhecido
  maxBid: real("max_bid"), // Lance máximo sustentável calculado
  auctionEndDate: integer("auction_end_date", { mode: "timestamp" }),
  auctionStartDate: integer("auction_start_date", { mode: "timestamp" }),
  vpt: real("vpt"), // Valor Patrimonial Tributário
  condominiumDebt: real("condominium_debt"), // Condomínio em atraso
  renovationEstimate: real("renovation_estimate"), // Estimativa de obras
  annualIncome: real("annual_income"), // Rendimento anual estimado (EUR/ano)
  maxBidCalculation: text("max_bid_calculation"), // JSON com breakdown dos custos
  assetClass: text("asset_class"), // apartment | house | urban_land | rural_land | commercial | garage | mixed
  valuationEngine: text("valuation_engine"), // hedonic | land_urban | land_rural | income | auction
  valuationConfidence: text("valuation_confidence"), // high | medium | low | very_low
  pdmStatus: text("pdm_status"), // buildable | restricted | non_buildable | unknown
  infrastructure: text("infrastructure"), // full | partial | none | unknown
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

export const rentalEstimates = sqliteTable("rental_estimates", {
  id: text("id").primaryKey(),
  district: text("district").notNull(),
  municipality: text("municipality").notNull(),
  type: text("type").notNull(), // T0, T1, T2, T3, T4, V2, V3, V4, V5, Loja, Armazém
  monthly_rent: real("monthly_rent").notNull(), // EUR/mês
  source: text("source").notNull(), // Idealista, INE, Confidencial Imobiliário
  as_of: text("as_of").notNull(), // YYYY-MM
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
  /**
   * Preço de venda.
   *
   * - fixed_price: é o asking_price publicado pelo anunciante.
   * - auction_*: é o current_bid (lance atual). Pode ser muito inferior ao max_bid
   *   (ex.: vendas da AT começam a 2-5% do valor avaliado).
   *
   * Para leilões, o yield e o score usam max_bid (custo real de arrematação),
   * NÃO este campo. Ver src/lib/valuation/score.ts, ramo listing_type === 'auction'.
   *
   * Inconsistência conhecida: currentBid está null para a maioria dos leilões
   * (o scraper usa price); max_bid é o campo canónico para leilões.
   */
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
