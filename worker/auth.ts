import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

const SESSION_COOKIE = "bts_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

async function sign(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${sigHex}`;
}

async function verify(token: string, secret: string): Promise<string | null> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.substring(0, lastDot);
  const expected = await sign(payload, secret);
  if (expected !== token) return null;

  const parts = payload.split(":");
  if (parts.length < 2) return null;

  const timestamp = parseInt(parts[1], 10);
  if (Date.now() / 1000 - timestamp > SESSION_MAX_AGE) return null;

  return parts[0];
}

export async function createSession(c: Context, userId: string, secret: string) {
  const payload = `${userId}:${Math.floor(Date.now() / 1000)}`;
  const token = await sign(payload, secret);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSessionUserId(c: Context, secret: string): Promise<string | null> {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  return verify(token, secret);
}

export function destroySession(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}
