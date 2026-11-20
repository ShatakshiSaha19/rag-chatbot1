import { auth } from "@clerk/nextjs/server";

// Reads the role from the Clerk session token. Requires the session token
// to include `{ "metadata": "{{user.public_metadata}}" }` (set in Clerk).
export async function isAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}
