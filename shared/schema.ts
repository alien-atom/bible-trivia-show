import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Territories table for regional leaderboard (continents/regions like Africa, Europe, Asia)
export const territories = pgTable("territories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  emblemColor: text("emblem_color").default("#6366f1").notNull(),
});

export const insertTerritorySchema = createInsertSchema(territories);
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;
export type Territory = typeof territories.$inferSelect;

// Countries table for country-level leaderboard (actual nations like USA, Nigeria, UK)
export const countries = pgTable("countries", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  code: varchar("code", { length: 3 }).notNull(),
  territoryId: varchar("territory_id").references(() => territories.id).notNull(),
  flagEmoji: text("flag_emoji"),
});

export const insertCountrySchema = createInsertSchema(countries);
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  countryId: varchar("country_id").references(() => countries.id),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// OTP codes table for email verification
export const otpCodes = pgTable("otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  used: true,
  createdAt: true,
});
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
export type OtpCode = typeof otpCodes.$inferSelect;

// User stats
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalScore: integer("total_score").default(0).notNull(),
  quizzesCompleted: integer("quizzes_completed").default(0).notNull(),
  battlesWon: integer("battles_won").default(0).notNull(),
  battlesPlayed: integer("battles_played").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  badges: jsonb("badges").$type<string[]>().default([]).notNull(),
  seenQuestionIds: jsonb("seen_question_ids").$type<string[]>().default([]).notNull(),
  lastQuizDate: timestamp("last_quiz_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Quiz sessions
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  categoryId: text("category_id").notNull(),
  score: integer("score").default(0).notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  timeTaken: integer("time_taken"),
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  completedAt: true,
});
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;

// Battle matches for real-time PvP
export const battleMatches = pgTable("battle_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: text("category_id").notNull(),
  status: varchar("status", { length: 20 }).default("waiting").notNull(),
  player1Id: varchar("player1_id").references(() => users.id),
  player2Id: varchar("player2_id").references(() => users.id),
  winnerId: varchar("winner_id").references(() => users.id),
  player1Score: integer("player1_score").default(0).notNull(),
  player2Score: integer("player2_score").default(0).notNull(),
  currentRound: integer("current_round").default(0).notNull(),
  totalRounds: integer("total_rounds").default(5).notNull(),
  questionIds: jsonb("question_ids").$type<string[]>().default([]).notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBattleMatchSchema = createInsertSchema(battleMatches).omit({
  id: true,
  createdAt: true,
});
export type InsertBattleMatch = z.infer<typeof insertBattleMatchSchema>;
export type BattleMatch = typeof battleMatches.$inferSelect;

// Battle rounds for tracking each question in a battle
export const battleRounds = pgTable("battle_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  battleId: varchar("battle_id").references(() => battleMatches.id, { onDelete: 'cascade' }).notNull(),
  roundNumber: integer("round_number").notNull(),
  questionId: text("question_id").notNull(),
  player1Answer: integer("player1_answer"),
  player2Answer: integer("player2_answer"),
  player1TimeMs: integer("player1_time_ms"),
  player2TimeMs: integer("player2_time_ms"),
  player1Points: integer("player1_points").default(0).notNull(),
  player2Points: integer("player2_points").default(0).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const insertBattleRoundSchema = createInsertSchema(battleRounds).omit({
  id: true,
});
export type InsertBattleRound = z.infer<typeof insertBattleRoundSchema>;
export type BattleRound = typeof battleRounds.$inferSelect;
