import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOtpCodeSchema, insertQuizSessionSchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendOtpEmail } from "./email";

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/auth/send-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: "Valid email is required" });
      }

      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await storage.createOtpCode({
        email,
        code,
        expiresAt
      });

      const emailSent = await sendOtpEmail(email, code);

      if (!emailSent) {
        return res.status(500).json({ error: "Failed to send verification email. Please try again." });
      }

      res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ error: "Email and code are required" });
      }

      const otpRecord = await storage.getValidOtpCode(email, code);

      if (!otpRecord) {
        return res.status(401).json({ error: "Invalid or expired code" });
      }

      await storage.markOtpAsUsed(otpRecord.id);

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        const name = email.split('@')[0];
        user = await storage.createUser({ email, name });
        
        await storage.createUserStats({
          userId: user.id,
          totalScore: 0,
          quizzesCompleted: 0,
          battlesWon: 0,
          battlesPlayed: 0,
          streak: 0,
          badges: [],
          seenQuestionIds: []
        });
      }

      req.session.userId = user.id;

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let country = null;
      let territory = null;
      if (user.countryId) {
        country = await storage.getCountry(user.countryId);
        if (country) {
          territory = await storage.getTerritory(country.territoryId);
        }
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        countryId: user.countryId,
        countryName: country?.name || null,
        flagEmoji: country?.flagEmoji || null,
        territoryId: country?.territoryId || null,
        territoryName: territory?.name || null
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const stats = await storage.getUserStats(req.session.userId);

      if (!stats) {
        const newStats = await storage.createUserStats({
          userId: req.session.userId,
          totalScore: 0,
          quizzesCompleted: 0,
          battlesWon: 0,
          battlesPlayed: 0,
          streak: 0,
          badges: [],
          seenQuestionIds: []
        });
        return res.json(newStats);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.patch("/api/stats", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const updates = req.body;
      const updatedStats = await storage.updateUserStats(req.session.userId, updates);

      res.json(updatedStats);
    } catch (error) {
      console.error("Error updating stats:", error);
      res.status(500).json({ error: "Failed to update stats" });
    }
  });

  app.post("/api/quiz/session", async (req, res) => {
    try {
      const sessionData = insertQuizSessionSchema.parse({
        ...req.body,
        userId: req.session.userId || null
      });

      const session = await storage.createQuizSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      console.error("Error saving quiz session:", error);
      res.status(500).json({ error: "Failed to save quiz session" });
    }
  });

  app.get("/api/quiz/history", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getUserQuizSessions(req.session.userId, limit);

      res.json(sessions);
    } catch (error) {
      console.error("Error getting quiz history:", error);
      res.status(500).json({ error: "Failed to get quiz history" });
    }
  });

  // Territory routes (regions like Africa, Europe, etc.)
  app.get("/api/territories", async (_req, res) => {
    try {
      const allTerritories = await storage.getAllTerritories();
      res.json(allTerritories);
    } catch (error) {
      console.error("Error getting territories:", error);
      res.status(500).json({ error: "Failed to get territories" });
    }
  });

  // Country routes (actual nations like USA, Nigeria, etc.)
  app.get("/api/countries", async (_req, res) => {
    try {
      const allCountries = await storage.getAllCountries();
      res.json(allCountries);
    } catch (error) {
      console.error("Error getting countries:", error);
      res.status(500).json({ error: "Failed to get countries" });
    }
  });

  app.get("/api/countries/by-territory/:territoryId", async (req, res) => {
    try {
      const { territoryId } = req.params;
      const countryList = await storage.getCountriesByTerritory(territoryId);
      res.json(countryList);
    } catch (error) {
      console.error("Error getting countries by territory:", error);
      res.status(500).json({ error: "Failed to get countries" });
    }
  });

  // Update user profile (country, displayName)
  app.patch("/api/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { countryId, displayName, name } = req.body;
      const updates: Record<string, any> = {};
      
      if (countryId !== undefined) updates.countryId = countryId;
      if (displayName !== undefined) updates.displayName = displayName;
      if (name !== undefined) updates.name = name;

      const user = await storage.updateUser(req.session.userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Global leaderboard
  app.get("/api/leaderboard/global", async (_req, res) => {
    try {
      const leaderboard = await storage.getGlobalLeaderboard(50);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting global leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Territory rankings (aggregated by region)
  app.get("/api/leaderboard/territories", async (_req, res) => {
    try {
      const rankings = await storage.getTerritoryRankings();
      res.json(rankings);
    } catch (error) {
      console.error("Error getting territory rankings:", error);
      res.status(500).json({ error: "Failed to get territory rankings" });
    }
  });

  // Territory leaderboard (players in a specific territory)
  app.get("/api/leaderboard/territory/:territoryId", async (req, res) => {
    try {
      const { territoryId } = req.params;
      const leaderboard = await storage.getTerritoryLeaderboard(territoryId, 50);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting territory leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Country rankings (aggregated by country)
  app.get("/api/leaderboard/countries", async (_req, res) => {
    try {
      const rankings = await storage.getCountryRankings();
      res.json(rankings);
    } catch (error) {
      console.error("Error getting country rankings:", error);
      res.status(500).json({ error: "Failed to get country rankings" });
    }
  });

  // Country leaderboard (players in a specific country)
  app.get("/api/leaderboard/country/:countryId", async (req, res) => {
    try {
      const { countryId } = req.params;
      const leaderboard = await storage.getCountryLeaderboard(countryId, 50);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting country leaderboard:", error);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  // Get user's rank
  app.get("/api/leaderboard/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const rank = await storage.getUserRank(req.session.userId);
      res.json(rank || null);
    } catch (error) {
      console.error("Error getting user rank:", error);
      res.status(500).json({ error: "Failed to get rank" });
    }
  });

  // Battle routes
  app.get("/api/battles/history", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const battles = await storage.getUserBattleHistory(req.session.userId, limit);
      res.json(battles);
    } catch (error) {
      console.error("Error getting battle history:", error);
      res.status(500).json({ error: "Failed to get battle history" });
    }
  });

  app.get("/api/battles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const battle = await storage.getBattleMatch(id);
      
      if (!battle) {
        return res.status(404).json({ error: "Battle not found" });
      }

      const rounds = await storage.getBattleRounds(id);
      res.json({ ...battle, rounds });
    } catch (error) {
      console.error("Error getting battle:", error);
      res.status(500).json({ error: "Failed to get battle" });
    }
  });

  return httpServer;
}
