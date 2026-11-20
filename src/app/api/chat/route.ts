import { google } from "@ai-sdk/google";
import {
  convertToModelMessages,
  type InferUITools,
  stepCountIs,
  streamText,
  tool,
  type UIDataTypes,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { searchDocuments } from "@/lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description:
      "Search the uploaded documents (PDFs) for information relevant to the user's question",
    inputSchema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
    }),
    execute: async ({ query }) => {
      try {
        // Search the vector database
        const results = await searchDocuments(query, 6, 0.4);

        if (results.length === 0) {
          return "No relevant information found in the knowledge base.";
        }

        // Format results for the AI, labelling which PDF each excerpt came from
        const formattedResults = results
          .map(
            (r, i) =>
              `[${i + 1}] (source: ${r.source ?? "unknown"})\n${r.content}`,
          )
          .join("\n\n");

        return formattedResults;
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;
export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      messages: await convertToModelMessages(messages),
      tools,
      system: `You are a helpful assistant that answers questions about documents (PDFs) an admin has uploaded to a shared knowledge base.
Rules:
- Always call searchKnowledgeBase before answering any question that could relate to the documents, including questions about "the PDF", "the document", "the resume", or a person mentioned in them.
- Use specific search queries (e.g. "technical skills", "education CGPA", "projects"). If the first search doesn't answer the question, search again with different wording.
- Base your answer only on the search results. Each result is labelled with its source file; prefer results from the document the user is asking about.
- If the results don't contain the answer, say it isn't mentioned in the uploaded documents. Don't ask the user who they mean; search first.
- Give concise answers that directly answer the question.`,
      // Allow a few search rounds and still leave a step to write the answer.
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse({
      // By default the AI SDK hides errors from the client ("An error occurred").
      // Log the full error to the server logs and send a readable message.
      onError: (error) => {
        console.error("CHAT STREAM ERROR:", error);
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
      }),
      {
        status: 500,
      },
    );
  }
}
