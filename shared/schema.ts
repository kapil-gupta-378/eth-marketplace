import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  ethBalance: decimal("eth_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  stethBalance: decimal("steth_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  rethBalance: decimal("reth_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  cbethBalance: decimal("cbeth_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  lrtBalances: jsonb("lrt_balances").notNull().default("{}"),
  totalValueUsd: decimal("total_value_usd", { precision: 18, scale: 2 }).notNull().default("0"),
  preferences: jsonb("preferences").notNull().default("{}"),
  availableCapitalMin: decimal("available_capital_min", { precision: 18, scale: 2 }).notNull().default("0"),
  availableCapitalMax: decimal("available_capital_max", { precision: 18, scale: 2 }).notNull().default("0"),
  emailAlertsEnabled: boolean("email_alerts_enabled").notNull().default(false),
  email: text("email"),
  isVerified: boolean("is_verified").notNull().default(false),
  badges: jsonb("badges").notNull().default("[]"),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  targetWalletId: integer("target_wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  fromWalletId: integer("from_wallet_id").references(() => wallets.id, { onDelete: "cascade" }),
  fromAnonymousTag: text("from_anonymous_tag"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  offerType: text("offer_type").notNull(), // 'cash', 'tokens', 'nft', 'irl', 'other'
  category: text("category").notNull().default("defi"), // 'defi', 'nft', 'irl', 'other'
  rewardValue: decimal("reward_value", { precision: 18, scale: 2 }),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  isAccepted: boolean("is_accepted").notNull().default(false),
  acceptedAt: timestamp("accepted_at"),
  contactInfo: text("contact_info"),
  termsLink: text("terms_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  offerId: integer("offer_id").notNull().references(() => offers.id, { onDelete: "cascade" }),
  fromWalletId: integer("from_wallet_id").references(() => wallets.id, { onDelete: "cascade" }),
  toWalletId: integer("to_wallet_id").references(() => wallets.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketplaceStats = pgTable("marketplace_stats", {
  id: serial("id").primaryKey(),
  totalWallets: integer("total_wallets").notNull().default(0),
  totalValueUsd: decimal("total_value_usd", { precision: 18, scale: 2 }).notNull().default("0"),
  activeOffers: integer("active_offers").notNull().default(0),
  dealsClosed: integer("deals_closed").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const walletsRelations = relations(wallets, ({ many }) => ({
  offersReceived: many(offers, { relationName: "targetWallet" }),
  offersSent: many(offers, { relationName: "fromWallet" }),
  messagesReceived: many(messages, { relationName: "toWallet" }),
  messagesSent: many(messages, { relationName: "fromWallet" }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  targetWallet: one(wallets, {
    fields: [offers.targetWalletId],
    references: [wallets.id],
    relationName: "targetWallet",
  }),
  fromWallet: one(wallets, {
    fields: [offers.fromWalletId],
    references: [wallets.id],
    relationName: "fromWallet",
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  offer: one(offers, {
    fields: [messages.offerId],
    references: [offers.id],
  }),
  fromWallet: one(wallets, {
    fields: [messages.fromWalletId],
    references: [wallets.id],
    relationName: "fromWallet",
  }),
  toWallet: one(wallets, {
    fields: [messages.toWalletId],
    references: [wallets.id],
    relationName: "toWallet",
  }),
}));

// Insert schemas
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOfferSchema = createInsertSchema(offers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MarketplaceStats = typeof marketplaceStats.$inferSelect;
