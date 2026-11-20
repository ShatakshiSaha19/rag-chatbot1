import { pgTable, serial, text, timestamp, vector } from "drizzle-orm/pg-core";

// No HNSW/IVFFlat index on `embedding`: pgvector can only index `vector`
// columns up to 2000 dimensions, and gemini-embedding-2 produces 3072.
// Similarity search does an exact scan, which is fine at this data size.
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 3072 }),
  // File name of the uploaded PDF this chunk came from (null for old rows).
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertDocument = typeof documents.$inferInsert;
export type SelectDocument = typeof documents.$inferSelect;
