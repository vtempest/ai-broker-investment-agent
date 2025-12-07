import { pgTable, text, timestamp, boolean, doublePrecision, integer } from "drizzle-orm/pg-core"

// User table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// Session table
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull(),
})

// Account table (for OAuth)
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: timestamp("expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// Verification table
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
})

// User Strategies
export const strategies = pgTable("strategies", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // momentum, mean-reversion, breakout, day-scalp
  status: text("status").notNull().default("paused"), // running, paused, paper
  riskLevel: text("risk_level").notNull().default("medium"),

  // Performance metrics
  todayPnL: doublePrecision("today_pnl").default(0),
  last7DaysPnL: doublePrecision("last_7days_pnl").default(0),
  last30DaysPnL: doublePrecision("last_30days_pnl").default(0),
  winRate: doublePrecision("win_rate").default(0),
  activeMarkets: integer("active_markets").default(0),
  tradesToday: integer("trades_today").default(0),

  // Configuration
  config: text("config"), // JSON string of strategy parameters

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// User Watchlist/Signals
export const signals = pgTable("signals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  asset: text("asset").notNull(),
  type: text("type").notNull(), // stock, prediction_market

  // Scores
  combinedScore: doublePrecision("combined_score").notNull(),
  scoreLabel: text("score_label").notNull(), // Strong Buy, Buy, Hold, Sell, Strong Sell

  // Driver scores
  fundamentalsScore: doublePrecision("fundamentals_score"),
  vixScore: doublePrecision("vix_score"),
  technicalScore: doublePrecision("technical_score"),
  sentimentScore: doublePrecision("sentiment_score"),

  // Metadata
  strategy: text("strategy"),
  timeframe: text("timeframe"),
  suggestedAction: text("suggested_action"),
  suggestedSize: text("suggested_size"),

  // Additional data
  metadata: text("metadata"), // JSON string with extra data

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// User Positions
export const positions = pgTable("positions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  asset: text("asset").notNull(),
  type: text("type").notNull(), // stock, prediction_market

  entryPrice: doublePrecision("entry_price").notNull(),
  currentPrice: doublePrecision("current_price").notNull(),
  size: doublePrecision("size").notNull(),

  unrealizedPnL: doublePrecision("unrealized_pnl").default(0),
  unrealizedPnLPercent: doublePrecision("unrealized_pnl_percent").default(0),

  strategy: text("strategy"),
  openedBy: text("opened_by"),
  openedAt: timestamp("opened_at").notNull(),
  closedAt: timestamp("closed_at"),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
})

// User Trades
export const trades = pgTable("trades", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  asset: text("asset").notNull(),
  type: text("type").notNull(), // stock, prediction_market
  action: text("action").notNull(), // buy, sell

  price: doublePrecision("price").notNull(),
  size: doublePrecision("size").notNull(),
  pnl: doublePrecision("pnl"),

  strategy: text("strategy"),
  copiedFrom: text("copied_from"),

  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").notNull(),
})

// Portfolio Summary
export const portfolios = pgTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),

  totalEquity: doublePrecision("total_equity").default(100000),
  cash: doublePrecision("cash").default(100000),
  stocks: doublePrecision("stocks").default(0),
  predictionMarkets: doublePrecision("prediction_markets").default(0),
  margin: doublePrecision("margin").default(0),

  dailyPnL: doublePrecision("daily_pnl").default(0),
  dailyPnLPercent: doublePrecision("daily_pnl_percent").default(0),
  winRate: doublePrecision("win_rate").default(0),
  openPositions: integer("open_positions").default(0),

  updatedAt: timestamp("updated_at").notNull(),
})
