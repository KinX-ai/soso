import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("fullName").notNull(),
  phoneNumber: text("phoneNumber").notNull(),
  bankAccount: text("bankAccount"),
  bankName: text("bankName"),
  balance: real("balance").notNull().default(0),
  role: text("role").notNull().default("user"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  isActive: true,
  balance: true,
  role: true,
});

// Transaction model for deposits/withdrawals
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: text("type").notNull(), // deposit, withdrawal
  amount: real("amount").notNull(),
  status: text("status").notNull(), // pending, completed, rejected
  method: text("method").notNull(), // bank_transfer, e_wallet
  bankAccount: text("bankAccount"),
  bankName: text("bankName"),
  reference: text("reference"), // Reference number for the transaction
  notes: text("notes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

// Lottery results model
export const lotteryResults = pgTable("lottery_results", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  region: text("region").notNull(), // mienbac, mientrung, miennam
  special: text("special").notNull(), // Special prize
  first: text("first").notNull(), // First prize
  second: jsonb("second").notNull(), // Second prize (Array)
  third: jsonb("third").notNull(), // Third prize (Array)
  fourth: jsonb("fourth").notNull(), // Fourth prize (Array)
  fifth: jsonb("fifth").notNull(), // Fifth prize (Array)
  sixth: jsonb("sixth").notNull(), // Sixth prize (Array)
  seventh: jsonb("seventh").notNull(), // Seventh prize (Array)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  // Cột updatedAt đã bị loại bỏ do không tồn tại trong database
});

export const insertLotteryResultSchema = createInsertSchema(lotteryResults).omit({
  id: true,
  createdAt: true,
});

// Bet types
export type BetType = 'lo' | 'de' | '3cang' | 'lo_xien_2' | 'lo_xien_3' | 'lo_xien_4';

// Bet model
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id),
  type: text("type").notNull(), // lo, de, 3cang, lo_xien_2, lo_xien_3, lo_xien_4
  numbers: jsonb("numbers").notNull(), // Array of numbers/combinations
  amount: real("amount").notNull(),
  multiplier: real("multiplier").notNull(), // payout multiplier
  date: timestamp("date").notNull(), // Date of the lottery draw
  status: text("status").notNull(), // pending, won, lost
  payout: real("payout"), // Payout amount if won
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  settledAt: timestamp("settledAt"), // When the bet was settled
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  status: true,
  payout: true,
  createdAt: true,
  settledAt: true,
});

// System settings model
export const settings = pgTable("settings", {
  key: text("key").notNull().primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  description: text("description"),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  updatedAt: true,
});

// For statistics tracking
export const numberStats = pgTable("number_stats", {
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  region: text("region").notNull(),
  occurrences: integer("occurrences").notNull().default(1),
  isPresent: boolean("isPresent").notNull().default(true), // Trường này là isPresent
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.number, table.date, table.region] }),
  };
});

export const insertNumberStatSchema = createInsertSchema(numberStats);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type LotteryResult = typeof lotteryResults.$inferSelect;
export type InsertLotteryResult = z.infer<typeof insertLotteryResultSchema>;

export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type NumberStat = typeof numberStats.$inferSelect;
export type InsertNumberStat = z.infer<typeof insertNumberStatSchema>;
