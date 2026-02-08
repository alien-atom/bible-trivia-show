import {
  type User,
  type InsertUser,
  type OtpCode,
  type InsertOtpCode,
  type UserStats,
  type InsertUserStats,
  type QuizSession,
  type InsertQuizSession,
  type Territory,
  type InsertTerritory,
  type Country,
  type InsertCountry,
  type BattleMatch,
  type InsertBattleMatch,
  type BattleRound,
  type InsertBattleRound,
  users,
  otpCodes,
  userStats,
  quizSessions,
  territories,
  countries,
  battleMatches,
  battleRounds,
} from "../shared/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type * as schema from "../shared/schema";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  countryId: string | null;
  countryName: string | null;
  flagEmoji: string | null;
  territoryId: string | null;
  territoryName: string | null;
  totalScore: number;
  quizzesCompleted: number;
  battlesWon: number;
  streak: number;
}

export interface TerritoryRanking {
  rank: number;
  territoryId: string;
  territoryName: string;
  emblemColor: string;
  totalScore: number;
  playerCount: number;
  avgScore: number;
}

export interface CountryRanking {
  rank: number;
  countryId: string;
  countryName: string;
  flagEmoji: string | null;
  territoryId: string;
  territoryName: string;
  totalScore: number;
  playerCount: number;
  avgScore: number;
}

type Db = NeonHttpDatabase<typeof schema>;

export class WorkerStorage {
  constructor(private db: Db) {}

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async createOtpCode(otp: InsertOtpCode): Promise<OtpCode> {
    const result = await this.db.insert(otpCodes).values(otp).returning();
    return result[0];
  }

  async getValidOtpCode(email: string, code: string): Promise<OtpCode | undefined> {
    const result = await this.db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.used, false),
          gte(otpCodes.expiresAt, new Date())
        )
      )
      .limit(1);
    return result[0];
  }

  async markOtpAsUsed(id: string): Promise<void> {
    await this.db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, id));
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const result = await this.db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
    return result[0];
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const result = await this.db.insert(userStats).values([stats]).returning();
    return result[0];
  }

  async updateUserStats(userId: string, updates: Partial<Omit<UserStats, "id" | "userId">>): Promise<UserStats | undefined> {
    const result = await this.db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return result[0];
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const result = await this.db.insert(quizSessions).values(session).returning();
    return result[0];
  }

  async getUserQuizSessions(userId: string, limit: number = 10): Promise<QuizSession[]> {
    return await this.db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt))
      .limit(limit);
  }

  async getAllTerritories(): Promise<Territory[]> {
    return await this.db.select().from(territories).orderBy(territories.region, territories.name);
  }

  async getTerritory(id: string): Promise<Territory | undefined> {
    const result = await this.db.select().from(territories).where(eq(territories.id, id)).limit(1);
    return result[0];
  }

  async createTerritory(territory: InsertTerritory): Promise<Territory> {
    const result = await this.db.insert(territories).values(territory).returning();
    return result[0];
  }

  async getAllCountries(): Promise<Country[]> {
    return await this.db.select().from(countries).orderBy(countries.name);
  }

  async getCountriesByTerritory(territoryId: string): Promise<Country[]> {
    return await this.db.select().from(countries).where(eq(countries.territoryId, territoryId)).orderBy(countries.name);
  }

  async getCountry(id: string): Promise<Country | undefined> {
    const result = await this.db.select().from(countries).where(eq(countries.id, id)).limit(1);
    return result[0];
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const result = await this.db.insert(countries).values(country).returning();
    return result[0];
  }

  async getGlobalLeaderboard(limit: number = 50): Promise<LeaderboardEntry[]> {
    const result = await this.db.execute(sql`
      SELECT 
        DENSE_RANK() OVER (ORDER BY us.total_score DESC, us.streak DESC) as rank,
        u.id as "userId",
        COALESCE(u.display_name, u.name, u.email) as "displayName",
        u.country_id as "countryId",
        c.name as "countryName",
        c.flag_emoji as "flagEmoji",
        c.territory_id as "territoryId",
        t.name as "territoryName",
        us.total_score as "totalScore",
        us.quizzes_completed as "quizzesCompleted",
        COALESCE(us.battles_won, 0) as "battlesWon",
        us.streak
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN countries c ON u.country_id = c.id
      LEFT JOIN territories t ON c.territory_id = t.id
      WHERE us.total_score > 0
      ORDER BY us.total_score DESC, us.streak DESC
      LIMIT ${limit}
    `);
    return result.rows as unknown as LeaderboardEntry[];
  }

  async getTerritoryLeaderboard(territoryId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const result = await this.db.execute(sql`
      SELECT 
        DENSE_RANK() OVER (ORDER BY us.total_score DESC, us.streak DESC) as rank,
        u.id as "userId",
        COALESCE(u.display_name, u.name, u.email) as "displayName",
        u.country_id as "countryId",
        c.name as "countryName",
        c.flag_emoji as "flagEmoji",
        c.territory_id as "territoryId",
        t.name as "territoryName",
        us.total_score as "totalScore",
        us.quizzes_completed as "quizzesCompleted",
        COALESCE(us.battles_won, 0) as "battlesWon",
        us.streak
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN countries c ON u.country_id = c.id
      LEFT JOIN territories t ON c.territory_id = t.id
      WHERE c.territory_id = ${territoryId} AND us.total_score > 0
      ORDER BY us.total_score DESC, us.streak DESC
      LIMIT ${limit}
    `);
    return result.rows as unknown as LeaderboardEntry[];
  }

  async getCountryLeaderboard(countryId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    const result = await this.db.execute(sql`
      SELECT 
        DENSE_RANK() OVER (ORDER BY us.total_score DESC, us.streak DESC) as rank,
        u.id as "userId",
        COALESCE(u.display_name, u.name, u.email) as "displayName",
        u.country_id as "countryId",
        c.name as "countryName",
        c.flag_emoji as "flagEmoji",
        c.territory_id as "territoryId",
        t.name as "territoryName",
        us.total_score as "totalScore",
        us.quizzes_completed as "quizzesCompleted",
        COALESCE(us.battles_won, 0) as "battlesWon",
        us.streak
      FROM users u
      JOIN user_stats us ON u.id = us.user_id
      LEFT JOIN countries c ON u.country_id = c.id
      LEFT JOIN territories t ON c.territory_id = t.id
      WHERE u.country_id = ${countryId} AND us.total_score > 0
      ORDER BY us.total_score DESC, us.streak DESC
      LIMIT ${limit}
    `);
    return result.rows as unknown as LeaderboardEntry[];
  }

  async getTerritoryRankings(): Promise<TerritoryRanking[]> {
    const result = await this.db.execute(sql`
      SELECT 
        DENSE_RANK() OVER (ORDER BY SUM(us.total_score) DESC) as rank,
        t.id as "territoryId",
        t.name as "territoryName",
        t.emblem_color as "emblemColor",
        COALESCE(SUM(us.total_score), 0) as "totalScore",
        COUNT(DISTINCT u.id) as "playerCount",
        COALESCE(ROUND(AVG(us.total_score)), 0) as "avgScore"
      FROM territories t
      LEFT JOIN countries c ON c.territory_id = t.id
      LEFT JOIN users u ON u.country_id = c.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      GROUP BY t.id, t.name, t.emblem_color
      ORDER BY "totalScore" DESC
    `);
    return result.rows as unknown as TerritoryRanking[];
  }

  async getCountryRankings(): Promise<CountryRanking[]> {
    const result = await this.db.execute(sql`
      SELECT 
        DENSE_RANK() OVER (ORDER BY SUM(us.total_score) DESC) as rank,
        c.id as "countryId",
        c.name as "countryName",
        c.flag_emoji as "flagEmoji",
        c.territory_id as "territoryId",
        t.name as "territoryName",
        COALESCE(SUM(us.total_score), 0) as "totalScore",
        COUNT(DISTINCT u.id) as "playerCount",
        COALESCE(ROUND(AVG(us.total_score)), 0) as "avgScore"
      FROM countries c
      LEFT JOIN territories t ON c.territory_id = t.id
      LEFT JOIN users u ON u.country_id = c.id
      LEFT JOIN user_stats us ON u.id = us.user_id
      GROUP BY c.id, c.name, c.flag_emoji, c.territory_id, t.name
      ORDER BY "totalScore" DESC
    `);
    return result.rows as unknown as CountryRanking[];
  }

  async getUserRank(userId: string): Promise<LeaderboardEntry | undefined> {
    const result = await this.db.execute(sql`
      WITH ranked AS (
        SELECT 
          DENSE_RANK() OVER (ORDER BY us.total_score DESC, us.streak DESC) as rank,
          u.id as "userId",
          COALESCE(u.display_name, u.name, u.email) as "displayName",
          u.country_id as "countryId",
          c.name as "countryName",
          c.flag_emoji as "flagEmoji",
          c.territory_id as "territoryId",
          t.name as "territoryName",
          us.total_score as "totalScore",
          us.quizzes_completed as "quizzesCompleted",
          COALESCE(us.battles_won, 0) as "battlesWon",
          us.streak
        FROM users u
        JOIN user_stats us ON u.id = us.user_id
        LEFT JOIN countries c ON u.country_id = c.id
        LEFT JOIN territories t ON c.territory_id = t.id
        WHERE us.total_score > 0
      )
      SELECT * FROM ranked WHERE "userId" = ${userId}
    `);
    return result.rows[0] as unknown as LeaderboardEntry | undefined;
  }

  async createBattleMatch(match: InsertBattleMatch): Promise<BattleMatch> {
    const result = await this.db.insert(battleMatches).values([match]).returning();
    return result[0];
  }

  async getBattleMatch(id: string): Promise<BattleMatch | undefined> {
    const result = await this.db.select().from(battleMatches).where(eq(battleMatches.id, id)).limit(1);
    return result[0];
  }

  async updateBattleMatch(id: string, updates: Partial<BattleMatch>): Promise<BattleMatch | undefined> {
    const result = await this.db
      .update(battleMatches)
      .set(updates)
      .where(eq(battleMatches.id, id))
      .returning();
    return result[0];
  }

  async getUserBattleHistory(userId: string, limit: number = 10): Promise<BattleMatch[]> {
    const result = await this.db.execute(sql`
      SELECT * FROM battle_matches 
      WHERE (player1_id = ${userId} OR player2_id = ${userId})
        AND status = 'completed'
      ORDER BY ended_at DESC
      LIMIT ${limit}
    `);
    return result.rows as unknown as BattleMatch[];
  }

  async createBattleRound(round: InsertBattleRound): Promise<BattleRound> {
    const result = await this.db.insert(battleRounds).values(round).returning();
    return result[0];
  }

  async getBattleRounds(battleId: string): Promise<BattleRound[]> {
    return await this.db
      .select()
      .from(battleRounds)
      .where(eq(battleRounds.battleId, battleId))
      .orderBy(battleRounds.roundNumber);
  }

  async updateBattleRound(id: string, updates: Partial<BattleRound>): Promise<BattleRound | undefined> {
    const result = await this.db
      .update(battleRounds)
      .set(updates)
      .where(eq(battleRounds.id, id))
      .returning();
    return result[0];
  }
}
