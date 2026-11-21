// src/app/chat/page.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { FileText, LoaderCircle, MessageSquare } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import "streamdown/styles.css";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

type DocumentInfo = { source: string };

export default function RAGChatBot() {
  const [input, setInput] = useState("");
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  // "" = all documents; otherwise the exact file name to chat with.
  const [selectedSource, setSelectedSource] = useState("");

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    regenerate,
    stop,
    clearError,
  } = useChat();
  const isBusy = status === "submitted" || status === "streaming";

  // Switching documents starts a fresh conversation, so answers about the
  // previous document (still in the chat history) can't carry over.
  const changeDocument = (source: string) => {
    setSelectedSource(source);
    if (messages.length > 0) {
      setMessages([]);
      clearError();
    }
  };

  // Load the document list; preselect ?doc=<file> (set after an upload).
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("doc");
    fetch("/api/documents")
      .then((res) => (res.ok ? res.json() : []))
      .then((docs: DocumentInfo[]) => {
        setDocuments(docs);
        if (requested && docs.some((d) => d.source === requested)) {
          setSelectedSource(requested);
        }
      })
      .catch(() => setDocuments([]));
  }, []);

  const requestBody = { source: selectedSource || undefined };

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text?.trim()) return;
    sendMessage({ text: message.text }, { body: requestBody });
    setInput("");
  };

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-5xl flex-col px-3 pb-3 pt-2 sm:px-6 sm:pb-6 sm:pt-4">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="gap-6 px-1 sm:px-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
              <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mb-2 font-heading text-2xl font-semibold sm:text-3xl">
                Ask about your <span className="marker italic">documents</span>
              </h2>
              <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                {selectedSource
                  ? `Answers will come only from "${selectedSource}".`
                  : "Pick a document below to focus on it, or ask across all uploaded documents."}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i) => {
                if (part.type !== "text") return null;
                return (
                  <Fragment key={`${message.id}-${i}`}>
                    <Message from={message.role}>
                      <MessageContent className="text-[15px] leading-relaxed sm:text-base">
                        {message.role === "assistant" ? (
                          // Render the bot's markdown (bold, bullet lists, etc.)
                          <MessageResponse
                            isAnimating={
                              status === "streaming" &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            {part.text}
                          </MessageResponse>
                        ) : (
                          <div className="whitespace-pre-wrap wrap-break-word">
                            {part.text}
                          </div>
                        )}
                      </MessageContent>
                    </Message>
                  </Fragment>
                );
              })}
            </div>
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {status === "submitted" ? "Searching documents…" : "Writing…"}
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm sm:flex-row sm:items-start">
              <div className="flex-1">
                <p className="font-medium">Couldn't get a response</p>
                <p className="mt-1 wrap-break-word text-muted-foreground">
                  {error?.message || "Something went wrong. Please try again."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => regenerate({ body: requestBody })}
                className="self-start rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-accent"
              >
                Retry
              </button>
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        onSubmit={handleSubmit}
        className="mt-2 w-full rounded-2xl bg-card shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] sm:mt-4"
      >
        <PromptInputBody>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            className="max-h-40 min-h-12 px-4 py-3 text-base sm:min-h-16"
          />
        </PromptInputBody>

        <PromptInputFooter className="px-2 pb-2">
          <PromptInputTools className="min-w-0 flex-1">
            <label className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-accent sm:text-sm">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="sr-only">Document to chat with</span>
              <select
                value={selectedSource}
                onChange={(e) => changeDocument(e.target.value)}
                disabled={isBusy}
                className="min-w-0 max-w-[55vw] truncate bg-transparent text-foreground outline-none sm:max-w-xs"
              >
                <option value="" className="bg-background">
                  All documents
                </option>
                {documents.map((d) => (
                  <option
                    key={d.source}
                    value={d.source}
                    className="bg-background"
                  >
                    {d.source}
                  </option>
                ))}
              </select>
            </label>
          </PromptInputTools>

          <PromptInputSubmit
            disabled={!isBusy && !input.trim()}
            status={status}
            onStop={stop}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
