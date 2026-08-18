import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-embedding-2",
});

export async function generateEmbedding(
  text: string
): Promise<number[]> {

  const result = await model.embedContent({
    content: {
      role: "user",
      parts: [{ text }],
    },
  });

  return result.embedding.values;
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {

  const embeddings = await Promise.all(
    texts.map(async (text) => {

      const result = await model.embedContent({
        content: {
          role: "user",
          parts: [{ text }],
        },
      });

      return result.embedding.values;
    })
  );

  return embeddings;
}