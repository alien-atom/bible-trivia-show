import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

export type WorkerEnv = {
  DATABASE_URL: string;
  SESSION_SECRET: string;
  SENDGRID_API_KEY: string;
  SENDGRID_FROM_EMAIL: string;
};

export function getDb(env: WorkerEnv) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}
