"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// Landing route after sign-in / sign-up: admins go to upload, everyone else to chat.
// Uses a full browser navigation (not a soft router redirect) so the switch
// can't get stuck mid-transition right after Clerk's sign-in modal closes.
export default function AfterSignIn() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.replace("/");
      return;
    }
    const role = user.publicMetadata?.role;
    window.location.replace(role === "admin" ? "/upload" : "/chat");
  }, [isLoaded, isSignedIn, user]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      Signing you in…
    </div>
  );
}
