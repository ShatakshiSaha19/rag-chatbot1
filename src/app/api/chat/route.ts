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
import { getDocumentText, listDocuments, searchDocuments } from "@/lib/search";

const tools = {
  searchKnowledgeBase: tool({
    description:
      "Semantic search over the uploaded PDFs. Returns the most relevant excerpts, each labelled with its source file. Best for specific questions (facts, names, numbers, definitions).",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "What to look for, phrased with the key terms likely to appear in the document",
        ),
      source: z
        .string()
        .optional()
        .describe(
          "Exact file name to search only within that document. Omit to search all documents.",
        ),
    }),
    execute: async ({ query, source }) => {
      try {
        const results = await searchDocuments(query, 8, 0.35, source);

        if (results.length === 0) {
          return source
            ? `No relevant excerpts found in "${source}".`
            : "No relevant information found in the uploaded documents.";
        }

        return results
          .map(
            (r, i) =>
              `[${i + 1}] (source: ${r.source ?? "older upload, unnamed"})\n${r.content}`,
          )
          .join("\n\n");
      } catch (error) {
        console.error("Search error:", error);
        return "Error searching the knowledge base.";
      }
    },
  }),

  readDocument: tool({
    description:
      "Read the full text of one uploaded PDF (very long documents are cut off at a limit). Use for broad questions: summaries, overviews, 'what is this document about', or listing everything of some kind.",
    inputSchema: z.object({
      source: z.string().describe("Exact file name of the document to read"),
    }),
    execute: async ({ source }) => {
      try {
        const { text, chunks, truncated } = await getDocumentText(source);
        if (chunks === 0) {
          return `No document named "${source}" was found.`;
        }
        return truncated
          ? `${text}\n\n[Document truncated: only the first part is shown. Use searchKnowledgeBase with source="${source}" for details from later sections.]`
          : text;
      } catch (error) {
        console.error("Read document error:", error);
        return "Error reading the document.";
      }
    },
  }),
};

function buildSystemPrompt(docs: { source: string | null }[]) {
  const docList =
    docs.length > 0
      ? docs.map((d, i) => `${i + 1}. ${d.source}`).join("\n")
      : "(no named documents yet)";

  return `You answer questions using PDFs that an admin uploaded to a shared knowledge base. The documents can be about any subject.

Uploaded documents, newest first:
${docList}

How to answer:
- Always use the tools before answering a question that could relate to the documents. Never answer document questions from memory.
- If the user refers to "the PDF", "this document", "the file" etc. without naming one, assume they mean the newest document (#1 above) unless the conversation shows otherwise.
- For broad questions (summarize, overview, what is it about, list all ...), use readDocument on the relevant file.
- For specific questions, use searchKnowledgeBase. Pass "source" when the question is about one particular document. Use the document's own terminology in the query. If results don't answer the question, search again with different wording or read the document.
- Base answers only on what the tools return. If the information isn't there, say it isn't mentioned in the uploaded documents.
- Be concise and direct. Use markdown (bold, bullet lists) when it helps readability. When several documents are involved, say which document each fact comes from.`;
}

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const docs = await listDocuments();

    const result = streamText({
      model: google("gemini-3.5-flash-lite"),
      messages: await convertToModelMessages(messages),
      tools,
      system: buildSystemPrompt(docs),
      // Allow several tool rounds and still leave a step to write the answer.
      stopWhen: stepCountIs(6),
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate response",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
