// src/app/upload/page.tsx
"use client";

import {
  CircleAlert,
  CircleCheck,
  CloudUpload,
  FileText,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { type DragEvent, useRef, useState } from "react";
import { HeroBackground } from "@/components/hero-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { processPdfFile } from "./actions";

// Matches serverActions.bodySizeLimit in next.config.ts.
const MAX_SIZE_MB = 10;

type Status =
  | { type: "idle" }
  | { type: "uploading" }
  | { type: "success"; text: string }
  | { type: "error"; text: string };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = status.type === "uploading";

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setStatus({ type: "error", text: "Please choose a PDF file." });
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus({
        type: "error",
        text: `This file is ${formatSize(selected.size)}. The maximum is ${MAX_SIZE_MB} MB.`,
      });
      return;
    }
    setFile(selected);
    setStatus({ type: "idle" });
  };

  const clearFile = () => {
    setFile(null);
    setStatus({ type: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isUploading) selectFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus({ type: "uploading" });

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const result = await processPdfFile(formData);

      if (result.success) {
        setStatus({
          type: "success",
          text: result.message || "PDF processed successfully",
        });
      } else {
        setStatus({
          type: "error",
          text: result.error || "Failed to process PDF",
        });
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus({
        type: "error",
        text: "The upload failed. The file may be too large for the server, so try a smaller PDF.",
      });
    }
  };

  return (
    <main className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-background px-4 py-10 text-foreground sm:py-16">
      <HeroBackground />

      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-black sm:text-4xl md:text-5xl">
            Upload{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Documents
            </span>
          </h1>
          <p className="text-muted-foreground">
            Add PDFs to the knowledge base. Everyone can then ask the chatbot
            about them.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl backdrop-blur-xl sm:p-6 md:p-8 dark:bg-white/5">
          {/* Drop zone */}
          {!file && (
            <label
              htmlFor="pdf-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center sm:px-6 sm:py-14 transition-colors",
                isDragging
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-border hover:border-purple-400/70 hover:bg-white/5",
              )}
            >
              <div className="mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 p-4">
                <CloudUpload className="h-8 w-8 text-cyan-400" />
              </div>
              <p className="text-lg font-semibold">
                Drag & drop a PDF here, or{" "}
                <span className="text-cyan-400 underline-offset-4 hover:underline">
                  browse
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                PDF with selectable text · up to {MAX_SIZE_MB} MB (4.5 MB on the
                live site)
              </p>
              <input
                ref={inputRef}
                id="pdf-upload"
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={(e) => selectFile(e.target.files?.[0])}
              />
            </label>
          )}

          {/* Selected file */}
          {file && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/40 p-4">
                <div className="rounded-xl bg-purple-500/15 p-3">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(file.size)}
                  </p>
                </div>
                {status.type !== "success" && !isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {status.type === "idle" && (
                <Button
                  size="lg"
                  className="w-full rounded-xl"
                  onClick={handleUpload}
                >
                  <CloudUpload className="mr-2 h-5 w-5" />
                  Upload & process
                </Button>
              )}

              {isUploading && (
                <div className="flex items-start gap-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
                  <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-cyan-400" />
                  <div>
                    <p className="font-medium">Processing your PDF…</p>
                    <p className="text-sm text-muted-foreground">
                      Extracting text, creating embeddings and saving. Large
                      files can take a minute, so keep this page open.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Result messages */}
          {status.type === "success" && (
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-medium">Upload complete</p>
                  <p className="text-sm text-muted-foreground">{status.text}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="flex-1 rounded-xl">
                  <Link
                    href={
                      file
                        ? `/chat?doc=${encodeURIComponent(file.name)}`
                        : "/chat"
                    }
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chat with this PDF
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={clearFile}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Upload another
                </Button>
              </div>
            </div>
          )}

          {status.type === "error" && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-400/10 p-4">
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="flex-1">
                <p className="font-medium">Something went wrong</p>
                <p className="text-sm text-muted-foreground">{status.text}</p>
              </div>
              {file && (
                <Button size="sm" variant="outline" onClick={handleUpload}>
                  Try again
                </Button>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Re-uploading a file with the same name replaces its previous version.
        </p>
      </div>
    </main>
  );
}
