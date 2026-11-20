import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set (add it to .env.local)");
  return url;
}

export default defineConfig({
  schema: "./src/lib/db-schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: requireDatabaseUrl(),
  },
});
