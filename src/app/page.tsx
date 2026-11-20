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

      <section className="container mx-auto px-6 pt-32 pb-20 text-center">
        <motion.h1
          className="text-6xl md:text-7xl font-black leading-tight mb-8"
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
          className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10"
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
                className="rounded-2xl text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all"
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
                  className="rounded-2xl text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all"
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

        <div className="grid md:grid-cols-3 gap-6 mt-24">
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
