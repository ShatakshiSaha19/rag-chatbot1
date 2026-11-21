"use client";

import { useUser } from "@clerk/nextjs";

import { motion } from "framer-motion";

import { MessageSquare, Shield, Upload } from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/feature-card";

import { HeroBackground } from "@/components/hero-background";
import { Button } from "@/components/ui/button";

import { useUserRole } from "@/hooks/useUserRole";

export default function HomePage() {
  const role = useUserRole();
  const { isSignedIn } = useUser();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <HeroBackground />

      <section className="container mx-auto px-4 pt-16 pb-16 text-center sm:px-6 sm:pt-24 md:pt-32 md:pb-20">
        <motion.h1
          className="mb-6 text-4xl font-black leading-tight sm:text-6xl md:mb-8 md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          AI Powered
          <span className="block bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            RAG Chatbot
          </span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-8 max-w-2xl text-base text-muted-foreground sm:mb-10 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          Upload PDFs, generate embeddings, and chat intelligently with your
          documents using AI.
        </motion.p>

        {isSignedIn ? (
          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <Link href="/chat">
              <Button
                size="lg"
                className="rounded-2xl px-6 py-5 text-base shadow-lg transition-all hover:scale-105 sm:px-8 sm:py-6 sm:text-lg"
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
                  className="rounded-2xl px-6 py-5 text-base shadow-lg transition-all hover:scale-105 sm:px-8 sm:py-6 sm:text-lg"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload PDFs
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <p className="text-muted-foreground text-lg">
              Sign in to start using the platform.
            </p>
          </motion.div>
        )}

        <div className="mt-16 grid gap-4 sm:grid-cols-2 sm:gap-6 md:mt-24 lg:grid-cols-3">
          <FeatureCard
            title="Smart Chat"
            description="Talk with your PDFs using AI powered semantic search and contextual retrieval."
            icon={<MessageSquare className="h-10 w-10 text-cyan-400" />}
          />

          <FeatureCard
            title="Secure Uploads"
            description="Role-based access ensures secure document uploading and management."
            icon={<Shield className="h-10 w-10 text-purple-400" />}
          />

          <FeatureCard
            title="Fast Embeddings"
            description="Gemini embeddings with blazing fast vector similarity search."
            icon={<Upload className="h-10 w-10 text-pink-400" />}
          />
        </div>
      </section>
    </main>
  );
}
