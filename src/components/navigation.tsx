"use client";

import Link from "next/link";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export const Navigation = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/20 border-b border-white/10">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">

        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
        >
          DocuMind
        </Link>

        <div className="flex items-center gap-3">

          <ThemeToggle />

          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton mode="modal">
                <Button>
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          ) : (
            <SignOutButton>
              <Button variant="outline">
                Sign Out
              </Button>
            </SignOutButton>
          )}
        </div>
      </div>
    </nav>
  );
};