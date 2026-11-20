// src/app/chat/page.tsx

//working
"use client";

import { useChat } from "@ai-sdk/react";
import { Fragment, useState } from "react";
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
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";

export default function RAGChatBot() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text) {
      return;
    }

    sendMessage({
      text: message.text,
    });

    setInput("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
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
                                <div className="whitespace-pre-wrap">
                                  {part.text}
                                </div>
                              )}
                            </MessageContent>
                          </Message>
                        </Fragment>
                      );

                    default:
                      return null;
                  }
                })}
              </div>
            ))}

            {(status === "submitted" || status === "streaming") && (
              <div>Loading...</div>
            )}
          </ConversationContent>

          <ConversationScrollButton />
        </Conversation>

        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 w-full rounded-2xl border border-border/50 bg-background/80 backdrop-blur"
        >
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the uploaded documents…"
              className="min-h-[72px] text-base px-5 py-4"
            />
          </PromptInputBody>

          <PromptInputTools>
            {/* Model selector, tools, etc */}

            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputTools>
        </PromptInput>
      </div>
    </div>
  );
}
