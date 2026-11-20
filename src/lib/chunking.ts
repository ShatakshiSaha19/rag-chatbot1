// src/lib/chunking.ts
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// ~1000-character chunks keep related lines (e.g. a whole paragraph or
// section) together, so each search hit gives the model real context.
export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 150,
  // Prefer splitting at paragraphs, then lines, then sentences, then words,
  // so words are never cut in half.
  separators: ["\n\n", "\n", ". ", " "],
});

export async function chunkContent(content: string) {
  return await textSplitter.splitText(content.trim());
}
