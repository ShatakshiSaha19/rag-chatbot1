// src/lib/search.ts
import { and, asc, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { getDb } from "./db-config";
import { documents } from "./db-schema";
import { generateEmbedding } from "./embeddings";

/**
 * Find the chunks most similar to `query`, optionally only within one
 * uploaded file, skipping duplicate text (a PDF may be uploaded twice).
 */
export async function searchDocuments(
  query: string,
  limit: number = 6,
  threshold: number = 0.35,
  source?: string,
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
    .where(
      source
        ? and(gt(similarity, threshold), eq(documents.source, source))
        : gt(similarity, threshold),
    )
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

/** Uploaded files, newest first (older rows without a file name are skipped). */
export async function listDocuments() {
  return getDb()
    .select({
      source: documents.source,
      chunks: sql<number>`count(*)::int`,
      uploadedAt: sql<Date>`max(${documents.createdAt})`,
    })
    .from(documents)
    .where(sql`${documents.source} is not null`)
    .groupBy(documents.source)
    .orderBy(sql`max(${documents.createdAt}) desc`);
}

/**
 * The full text of one uploaded file, in original order, capped at `maxChars`
 * so very large PDFs don't overflow the model's context.
 */
export async function getDocumentText(source: string, maxChars = 60_000) {
  const rows = await getDb()
    .select({ content: documents.content })
    .from(documents)
    .where(eq(documents.source, source))
    .orderBy(asc(documents.id));

  let text = "";
  let truncated = false;
  for (const row of rows) {
    if (text.length + row.content.length > maxChars) {
      truncated = true;
      break;
    }
    text += `${row.content}\n\n`;
  }
  return { text: text.trim(), chunks: rows.length, truncated };
}
