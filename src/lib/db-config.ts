import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { requireEnv } from "./env";

// Next.js loads .env.local itself; the client is created on first use so
// building the app doesn't require DATABASE_URL.
let db: NeonHttpDatabase | undefined;

export function getDb() {
  db ??= drizzle(neon(requireEnv("DATABASE_URL")));
  return db;
}
