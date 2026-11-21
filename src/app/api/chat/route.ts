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
import { getChatModel } from "@/lib/chat-model";
import { getDocumentText, listDocuments, searchDocuments } from "@/lib/search";

/**
 * Build the tools. When the user has selected one document in the chat,
 * every search/read is locked to that file so answers can't come from
 * another PDF.
 */
function createTools(selectedSource?: string) {
  return {
    searchKnowledgeBase: tool({
      description: selectedSource
        ? `Semantic search inside "${selectedSource}". Returns the most relevant excerpts. Best for specific questions (facts, names, numbers, definitions).`
        : "Semantic search over the uploaded PDFs. Returns the most relevant excerpts, each labelled with its source file. Best for specific questions (facts, names, numbers, definitions).",
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
        const scope = selectedSource ?? source;
        try {
          const results = await searchDocuments(query, 8, 0.35, scope);

          if (results.length === 0) {
            return scope
              ? `No relevant excerpts found in "${scope}".`
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
        const target = selectedSource ?? source;
        try {
          const { text, chunks, truncated } = await getDocumentText(target);
          if (chunks === 0) {
            return `No document named "${target}" was found.`;
          }
          return truncated
            ? `${text}\n\n[Document truncated: only the first part is shown. Use searchKnowledgeBase for details from later sections.]`
            : text;
        } catch (error) {
          console.error("Read document error:", error);
          return "Error reading the document.";
        }
      },
    }),
  };
}

function buildSystemPrompt(
  docs: { source: string | null }[],
  selectedSource?: string,
) {
  const docList =
    docs.length > 0
      ? docs.map((d, i) => `${i + 1}. ${d.source}`).join("\n")
      : "(no named documents yet)";

  const scope = selectedSource
    ? `The user has selected ONE document to chat with: "${selectedSource}".
Answer only from this document. "The PDF", "this document", "it" etc. all mean this document. If the answer isn't in it, say it isn't mentioned in "${selectedSource}". Don't use other documents.`
    : `The user is chatting with ALL uploaded documents (newest first):
${docList}
If the user says "the PDF", "this document" etc. without naming one, assume the newest document (#1). When a question could match several documents, prefer the one the question's wording fits best, and say which document each fact comes from.`;

  return `You answer questions using PDFs that an admin uploaded to a knowledge base. The documents can be about any subject.

${scope}

How to answer:
- Always use the tools before answering a question that could relate to the documents. Never answer document questions from memory.
- For broad questions (summarize, overview, what is it about, list all ...), use readDocument.
- For specific questions, use searchKnowledgeBase with the document's own terminology. If results don't answer the question, search again with different wording or read the document.
- Base answers only on what the tools return. If the information isn't there, say so plainly.
- Don't assume the user is a person described in a document (e.g. a resume's owner) unless they say so.
- Be concise and direct. Use markdown (bold, bullet lists) when it helps readability.`;
}

export type ChatTools = InferUITools<ReturnType<typeof createTools>>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
  try {
    const { messages, source }: { messages: ChatMessage[]; source?: string } =
      await req.json();

    const docs = await listDocuments();
    // Only honour a selection that matches an existing document.
    const selectedSource =
      source && docs.some((d) => d.source === source) ? source : undefined;

    const result = streamText({
      model: getChatModel(),
      messages: await convertToModelMessages(messages),
      tools: createTools(selectedSource),
      system: buildSystemPrompt(docs, selectedSource),
      // Allow several tool rounds and still leave a step to write the answer.
      stopWhen: stepCountIs(6),
      // Retry the whole call a few more times if every model is busy.
      maxRetries: 3,
    });

    return result.toUIMessageStreamResponse({
      // By default the AI SDK hides errors from the client ("An error occurred").
      // Log the full error to the server logs and send a readable message.
      onError: (error) => {
        console.error("CHAT STREAM ERROR:", error);
        const message = error instanceof Error ? error.message : String(error);
        return /high demand|overloaded|unavailable|429|503/i.test(message)
          ? "The AI service is busy right now. Please try again in a moment."
          : message;
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
