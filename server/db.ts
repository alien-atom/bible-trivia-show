import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

let client: pg.Client | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function connectDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  if (!client) {
    client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    dbInstance = drizzle(client, { schema });
  }
}

export function getDb() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call connectDb() first.");
  }
  return dbInstance;
}

export { dbInstance as db };
