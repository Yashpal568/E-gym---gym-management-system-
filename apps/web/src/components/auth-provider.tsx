"use client";
import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  // Keep CI/build usable before deployment secrets are configured. Production
  // deployments must set the key to enable Clerk sign-in and protected UI.
  if (!publishableKey) return <>{children}</>;
  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
