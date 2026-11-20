import {
  type GenerativeModel,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { requireEnv } from "./env";

// Created on first use so building the app doesn't require the API key.
let model: GenerativeModel | undefined;

function getModel() {
  model ??= new GoogleGenerativeAI(
    requireEnv("GOOGLE_GENERATIVE_AI_API_KEY"),
  ).getGenerativeModel({ model: "gemini-embedding-2" });
  return model;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry rate-limit (429) and temporary server errors (5xx) with exponential
 * backoff, so a large PDF doesn't fail just because the free tier is busy.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 6): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as { status?: number }).status;
      const retryable =
        status === 429 || (status !== undefined && status >= 500);
      if (!retryable || attempt >= attempts) throw error;
      const delay = 2000 * 2 ** (attempt - 1); // 2s, 4s, 8s, 16s, 32s
      console.warn(
        `Gemini embedding error ${status}, retrying in ${delay / 1000}s (attempt ${attempt}/${attempts - 1})`,
      );
      await sleep(delay);
    }
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await withRetry(() =>
    getModel().embedContent({
      content: {
        role: "user",
        parts: [{ text }],
      },
    }),
  );

  return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Embed in batches (max 100 per Gemini batch request), one batch at a time,
  // so large PDFs don't fire thousands of parallel requests and hit rate limits.
  const BATCH_SIZE = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await withRetry(() =>
      getModel().batchEmbedContents({
        requests: batch.map((text) => ({
          content: { role: "user", parts: [{ text }] },
        })),
      }),
    );
    embeddings.push(...result.embeddings.map((e) => e.values));
  }

  return embeddings;
}
