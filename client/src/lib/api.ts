import type { UserStats, QuizSession } from "@shared/schema";

const API_BASE = "/api";

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    displayName: string | null;
    territoryId: string | null;
  };
  message?: string;
  error?: string;
}

export const api = {
  // Auth endpoints
  async sendOtp(email: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
      credentials: "include",
    });
    return res.json();
  },

  async getMe(): Promise<{ id: string; email: string; name: string | null; displayName: string | null; territoryId: string | null } | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  // Stats endpoints
  async getStats(): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch stats");
    }
    return res.json();
  },

  async updateStats(updates: Partial<UserStats>): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/stats`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to update stats");
    }
    return res.json();
  },

  // Quiz endpoints
  async saveQuizSession(session: {
    categoryId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken?: number;
  }): Promise<QuizSession> {
    const res = await fetch(`${API_BASE}/quiz/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(session),
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to save quiz session");
    }
    return res.json();
  },

  async getQuizHistory(limit = 10): Promise<QuizSession[]> {
    const res = await fetch(`${API_BASE}/quiz/history?limit=${limit}`, {
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch quiz history");
    }
    return res.json();
  },
};
