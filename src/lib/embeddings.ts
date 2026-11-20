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

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await getModel().embedContent({
    content: {
      role: "user",
      parts: [{ text }],
    },
  });

  return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Embed in batches (max 100 per Gemini batch request), one batch at a time,
  // so large PDFs don't fire thousands of parallel requests and hit rate limits.
  const BATCH_SIZE = 100;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const result = await getModel().batchEmbedContents({
      requests: batch.map((text) => ({
        content: { role: "user", parts: [{ text }] },
      })),
    });
    embeddings.push(...result.embeddings.map((e) => e.values));
  }

  return embeddings;
}
