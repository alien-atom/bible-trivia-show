import { Hono } from "hono";
import { cors } from "hono/cors";
import { getDb, type WorkerEnv } from "./db";
import { WorkerStorage } from "./storage";
import { sendOtpEmail } from "./email";
import { createSession, getSessionUserId, destroySession } from "./auth";
import { insertQuizSessionSchema } from "../shared/schema";
import { ZodError } from "zod";

type Bindings = WorkerEnv;

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

function getStorage(env: WorkerEnv) {
  const db = getDb(env);
  return new WorkerStorage(db);
}

function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.get("/api/health", (c) => c.json({ status: "ok" }));
app.get("/health", (c) => c.text("OK"));

app.post("/api/auth/send-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email || !email.includes("@")) {
      return c.json({ error: "Valid email is required" }, 400);
    }

    const storage = getStorage(c.env);
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await storage.createOtpCode({ email, code, expiresAt });
    const emailSent = await sendOtpEmail(c.env, email, code);

    if (!emailSent) {
      return c.json({ error: "Failed to send verification email. Please try again." }, 500);
    }

    return c.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return c.json({ error: "Failed to send OTP" }, 500);
  }
});

app.post("/api/auth/verify-otp", async (c) => {
  try {
    const { email, code } = await c.req.json();
    if (!email || !code) {
      return c.json({ error: "Email and code are required" }, 400);
    }

    const storage = getStorage(c.env);
    const otpRecord = await storage.getValidOtpCode(email, code);

    if (!otpRecord) {
      return c.json({ error: "Invalid or expired code" }, 401);
    }

    await storage.markOtpAsUsed(otpRecord.id);

    let user = await storage.getUserByEmail(email);
    if (!user) {
      const name = email.split("@")[0];
      user = await storage.createUser({ email, name });
      await storage.createUserStats({
        userId: user.id,
        totalScore: 0,
        quizzesCompleted: 0,
        battlesWon: 0,
        battlesPlayed: 0,
        streak: 0,
        badges: [],
        seenQuestionIds: [],
      });
    }

    await createSession(c, user.id, c.env.SESSION_SECRET);

    return c.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return c.json({ error: "Failed to verify OTP" }, 500);
  }
});

app.get("/api/auth/me", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const user = await storage.getUser(userId);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    let country = null;
    let territory = null;
    if (user.countryId) {
      country = await storage.getCountry(user.countryId);
      if (country) {
        territory = await storage.getTerritory(country.territoryId);
      }
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      countryId: user.countryId,
      countryName: country?.name || null,
      flagEmoji: country?.flagEmoji || null,
      territoryId: country?.territoryId || null,
      territoryName: territory?.name || null,
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

app.post("/api/auth/logout", async (c) => {
  destroySession(c);
  return c.json({ success: true });
});

app.get("/api/stats", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const stats = await storage.getUserStats(userId);

    if (!stats) {
      const newStats = await storage.createUserStats({
        userId,
        totalScore: 0,
        quizzesCompleted: 0,
        battlesWon: 0,
        battlesPlayed: 0,
        streak: 0,
        badges: [],
        seenQuestionIds: [],
      });
      return c.json(newStats);
    }

    return c.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    return c.json({ error: "Failed to get stats" }, 500);
  }
});

app.patch("/api/stats", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const updates = await c.req.json();
    const updatedStats = await storage.updateUserStats(userId, updates);
    return c.json(updatedStats);
  } catch (error) {
    console.error("Error updating stats:", error);
    return c.json({ error: "Failed to update stats" }, 500);
  }
});

app.post("/api/quiz/session", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    const body = await c.req.json();
    const sessionData = insertQuizSessionSchema.parse({
      ...body,
      userId: userId || null,
    });

    const storage = getStorage(c.env);
    const session = await storage.createQuizSession(sessionData);
    return c.json(session);
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json({ error: "Invalid session data", details: error.errors }, 400);
    }
    console.error("Error saving quiz session:", error);
    return c.json({ error: "Failed to save quiz session" }, 500);
  }
});

app.get("/api/quiz/history", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;
    const sessions = await storage.getUserQuizSessions(userId, limit);
    return c.json(sessions);
  } catch (error) {
    console.error("Error getting quiz history:", error);
    return c.json({ error: "Failed to get quiz history" }, 500);
  }
});

app.get("/api/territories", async (c) => {
  try {
    const storage = getStorage(c.env);
    return c.json(await storage.getAllTerritories());
  } catch (error) {
    console.error("Error getting territories:", error);
    return c.json({ error: "Failed to get territories" }, 500);
  }
});

app.get("/api/countries", async (c) => {
  try {
    const storage = getStorage(c.env);
    return c.json(await storage.getAllCountries());
  } catch (error) {
    console.error("Error getting countries:", error);
    return c.json({ error: "Failed to get countries" }, 500);
  }
});

app.get("/api/countries/by-territory/:territoryId", async (c) => {
  try {
    const storage = getStorage(c.env);
    const { territoryId } = c.req.param();
    return c.json(await storage.getCountriesByTerritory(territoryId));
  } catch (error) {
    console.error("Error getting countries by territory:", error);
    return c.json({ error: "Failed to get countries" }, 500);
  }
});

app.patch("/api/profile", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const { countryId, displayName, name } = await c.req.json();
    const updates: Record<string, any> = {};
    if (countryId !== undefined) updates.countryId = countryId;
    if (displayName !== undefined) updates.displayName = displayName;
    if (name !== undefined) updates.name = name;

    const user = await storage.updateUser(userId, updates);
    return c.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

app.get("/api/leaderboard/global", async (c) => {
  try {
    const storage = getStorage(c.env);
    return c.json(await storage.getGlobalLeaderboard(50));
  } catch (error) {
    console.error("Error getting global leaderboard:", error);
    return c.json({ error: "Failed to get leaderboard" }, 500);
  }
});

app.get("/api/leaderboard/territories", async (c) => {
  try {
    const storage = getStorage(c.env);
    return c.json(await storage.getTerritoryRankings());
  } catch (error) {
    console.error("Error getting territory rankings:", error);
    return c.json({ error: "Failed to get territory rankings" }, 500);
  }
});

app.get("/api/leaderboard/territory/:territoryId", async (c) => {
  try {
    const storage = getStorage(c.env);
    const { territoryId } = c.req.param();
    return c.json(await storage.getTerritoryLeaderboard(territoryId, 50));
  } catch (error) {
    console.error("Error getting territory leaderboard:", error);
    return c.json({ error: "Failed to get leaderboard" }, 500);
  }
});

app.get("/api/leaderboard/countries", async (c) => {
  try {
    const storage = getStorage(c.env);
    return c.json(await storage.getCountryRankings());
  } catch (error) {
    console.error("Error getting country rankings:", error);
    return c.json({ error: "Failed to get country rankings" }, 500);
  }
});

app.get("/api/leaderboard/country/:countryId", async (c) => {
  try {
    const storage = getStorage(c.env);
    const { countryId } = c.req.param();
    return c.json(await storage.getCountryLeaderboard(countryId, 50));
  } catch (error) {
    console.error("Error getting country leaderboard:", error);
    return c.json({ error: "Failed to get leaderboard" }, 500);
  }
});

app.get("/api/leaderboard/me", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const rank = await storage.getUserRank(userId);
    return c.json(rank || null);
  } catch (error) {
    console.error("Error getting user rank:", error);
    return c.json({ error: "Failed to get rank" }, 500);
  }
});

app.get("/api/battles/history", async (c) => {
  try {
    const userId = await getSessionUserId(c, c.env.SESSION_SECRET);
    if (!userId) {
      return c.json({ error: "Not authenticated" }, 401);
    }

    const storage = getStorage(c.env);
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : 10;
    const battles = await storage.getUserBattleHistory(userId, limit);
    return c.json(battles);
  } catch (error) {
    console.error("Error getting battle history:", error);
    return c.json({ error: "Failed to get battle history" }, 500);
  }
});

app.get("/api/battles/:id", async (c) => {
  try {
    const storage = getStorage(c.env);
    const { id } = c.req.param();
    const battle = await storage.getBattleMatch(id);

    if (!battle) {
      return c.json({ error: "Battle not found" }, 404);
    }

    const rounds = await storage.getBattleRounds(id);
    return c.json({ ...battle, rounds });
  } catch (error) {
    console.error("Error getting battle:", error);
    return c.json({ error: "Failed to get battle" }, 500);
  }
});

export default app;
