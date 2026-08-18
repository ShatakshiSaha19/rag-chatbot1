// src/hooks/useUserRole.ts
import { useUser } from "@clerk/nextjs";

export function useUserRole() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  return role || "user";
}
