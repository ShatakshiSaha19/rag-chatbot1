"use client";

import { useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import { MessageSquare, Shield, Upload } from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";
import { HeroBackground } from "@/components/hero-background";
import { Button } from "@/components/ui/button";
import { useUserRole } from "@/hooks/useUserRole";

const FEATURES = [
  {
    title: "Smart Chat",
    description:
      "Talk with your PDFs using AI powered semantic search and contextual retrieval.",
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
  },
  {
    title: "Secure Uploads",
    description:
      "Role-based access ensures secure document uploading and management.",
    icon: <Shield className="h-6 w-6 text-tomato" />,
  },
  {
    title: "Fast Embeddings",
    description:
      "Gemini embeddings with blazing fast vector similarity search.",
    icon: <Upload className="h-6 w-6 text-chart-3" />,
  },
];

export default function HomePage() {
  const role = useUserRole();
  const { isSignedIn } = useUser();
  const reduceMotion = useReducedMotion();

  // Words rise in one after another (skipped if the user prefers reduced motion).
  const word = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 28, filter: "blur(6px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: {
            delay,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        };
  const fadeUp = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6 },
        };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ---------- Hero with animated scene ---------- */}
      <section className="relative isolate overflow-hidden">
        <HeroBackground />

        <div className="container mx-auto px-4 pt-14 pb-44 text-center sm:px-6 sm:pt-20 sm:pb-56 md:pt-28 md:pb-72">
          <h1 className="mb-6 font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:mb-8 md:text-7xl dark:[text-shadow:0_0_32px_rgb(255_79_163/0.35)]">
            <motion.span className="inline-block" {...word(0.05)}>
              AI
            </motion.span>{" "}
            <motion.span className="inline-block" {...word(0.18)}>
              Powered
            </motion.span>
            <motion.span className="mt-1 block italic" {...word(0.32)}>
              <span className="marker marker-animate">RAG Chatbot</span>
            </motion.span>
          </h1>

          <motion.p
            className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:mb-10 sm:text-lg dark:text-foreground/80"
            {...fadeUp(0.5)}
          >
            Upload PDFs, generate embeddings, and chat intelligently with your
            documents using AI.
          </motion.p>

          {isSignedIn ? (
            <motion.div
              className="flex flex-wrap justify-center gap-3 sm:gap-4"
              {...fadeUp(0.65)}
            >
              <Link href="/chat">
                <Button
                  size="lg"
                  className="rounded-full px-6 py-5 text-base shadow-sm transition-all hover:-translate-y-0.5 sm:px-8 sm:py-6 sm:text-lg dark:shadow-[0_0_24px_-4px_rgb(255_79_163/0.7)] dark:hover:shadow-[0_0_34px_-2px_rgb(255_79_163/0.9)]"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Start Chat
                </Button>
              </Link>

              {role === "admin" && (
                <Link href="/upload">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="rounded-full border border-border px-6 py-5 text-base shadow-sm transition-all hover:-translate-y-0.5 sm:px-8 sm:py-6 sm:text-lg dark:border-primary/40 dark:bg-background/60 dark:backdrop-blur-sm"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload PDFs
                  </Button>
                </Link>
              )}
            </motion.div>
          ) : (
            <motion.div {...fadeUp(0.65)}>
              <p className="text-lg italic text-muted-foreground dark:text-foreground/80">
                Sign in to start using the platform.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="container mx-auto px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className={i === 2 ? "sm:col-span-2 lg:col-span-1" : undefined}
              {...(reduceMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 32 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, amount: 0.15 },
                    transition: {
                      delay: i * 0.12,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1] as const,
                    },
                  })}
            >
              <FeatureCard
                title={f.title}
                description={f.description}
                index={i + 1}
                icon={f.icon}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
