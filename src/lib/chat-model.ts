import { google } from "@ai-sdk/google";
import { type LanguageModel, wrapLanguageModel } from "ai";

// Tried in order. If Gemini reports a model as overloaded ("high demand"),
// rate-limited, or otherwise fails before answering, the next one is used.
const CHAT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash",
];

export function getChatModel(): LanguageModel {
  return createFallbackModel(CHAT_MODELS);
}

/** A model that tries each Gemini model id in order until one responds. */
export function createFallbackModel(modelIds: string[]): LanguageModel {
  const [primary, ...fallbacks] = modelIds.map((id) => google(id));

  return wrapLanguageModel({
    model: primary,
    middleware: {
      specificationVersion: "v3",
      wrapStream: async ({ doStream, params }) => {
        try {
          return await doStream();
        } catch (firstError) {
          let lastError = firstError;
          for (const model of fallbacks) {
            console.warn(
              `Chat model failed (${errorText(lastError)}), falling back to ${model.modelId}`,
            );
            try {
              return await model.doStream(params);
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError;
        }
      },
      wrapGenerate: async ({ doGenerate, params }) => {
        try {
          return await doGenerate();
        } catch (firstError) {
          let lastError = firstError;
          for (const model of fallbacks) {
            try {
              return await model.doGenerate(params);
            } catch (error) {
              lastError = error;
            }
          }
          throw lastError;
        }
      },
    },
  });
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 120) : String(error);
}
