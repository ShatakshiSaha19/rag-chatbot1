// src/lib/search.ts
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { getDb } from "./db-config";
import { documents } from "./db-schema";
import { generateEmbedding } from "./embeddings";

/**
 * Find the chunks most similar to `query`, skipping duplicate text
 * (the same PDF may have been uploaded more than once).
 */
export async function searchDocuments(
  query: string,
  limit: number = 6,
  threshold: number = 0.4,
) {
  const embedding = await generateEmbedding(query);

  const similarity = sql<number>`1 - (${cosineDistance(
    documents.embedding,
    embedding,
  )})`;

  // Fetch extra rows so we still have `limit` results after removing duplicates.
  const rows = await getDb()
    .select({
      id: documents.id,
      content: documents.content,
      source: documents.source,
      similarity,
    })
    .from(documents)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit * 3);

  const seen = new Set<string>();
  const unique = rows.filter((row) => {
    const key = row.content.trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, limit);
}
