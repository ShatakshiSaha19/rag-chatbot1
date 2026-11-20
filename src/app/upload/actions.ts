// src/app/upload/actions.ts
"use server";

import { eq } from "drizzle-orm";
import pdf from "pdf-parse";
import { isAdmin } from "@/lib/auth";
import { chunkContent } from "@/lib/chunking";
import { getDb } from "@/lib/db-config";
import { documents } from "@/lib/db-schema";
import { generateEmbeddings } from "@/lib/embeddings";

export async function processPdfFile(formData: FormData) {
  // Server actions are callable directly, so check the role here too.
  if (!(await isAdmin())) {
    return { success: false, error: "Only admins can upload PDFs" };
  }

  try {
    const file = formData.get("pdf") as File;

    // Convert File to Buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);

    if (!data.text || data.text.trim().length === 0) {
      return {
        success: false,
        error: "No text found in PDF",
      };
    }

    // Chunk the text
    const chunks = await chunkContent(data.text);

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // Re-uploading a file with the same name replaces its old chunks
    // instead of storing duplicates.
    await getDb().delete(documents).where(eq(documents.source, file.name));

    // Store in database
    const records = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      source: file.name,
    }));

    // Insert in batches: each row carries a 3072-dim vector, so one huge
    // INSERT for a large PDF can exceed the database request size limit.
    const INSERT_BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += INSERT_BATCH_SIZE) {
      await getDb()
        .insert(documents)
        .values(records.slice(i, i + INSERT_BATCH_SIZE));
    }

    return {
      success: true,
      message: `Created ${records.length} searchable chunks`,
    };
  } catch (error) {
    console.error("PDF processing error:", error);
    return {
      success: false,
      error: "Failed to process PDF",
    };
  }
}
