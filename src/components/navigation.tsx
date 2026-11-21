"use client";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { BookOpenText } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export const Navigation = () => {
  const { isSignedIn } = useUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight sm:text-2xl"
        >
          <span className="hidden h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground min-[400px]:grid">
            <BookOpenText className="h-4.5 w-4.5" />
          </span>
          <span>
            Docu<span className="italic text-primary">Mind</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <ThemeToggle />

          {!isSignedIn ? (
            <>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/after-sign-in"
                signUpForceRedirectUrl="/after-sign-in"
              >
                <Button variant="ghost">Sign In</Button>
              </SignInButton>

              <SignUpButton
                mode="modal"
                forceRedirectUrl="/after-sign-in"
                signInForceRedirectUrl="/after-sign-in"
              >
                <Button className="rounded-full">Sign Up</Button>
              </SignUpButton>
            </>
          ) : (
            <SignOutButton>
              <Button variant="outline" className="rounded-full">
                Sign Out
              </Button>
            </SignOutButton>
          )}
        </div>
      </div>
    </nav>
  );
};
