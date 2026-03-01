"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useProfile — thin re-export from the shared ProfileProvider context.
//
// Before R2 this hook called getOrCreateProfile() on its own, causing
// 3-5 redundant Supabase round-trips per page. Now every consumer reads
// from a single React Context populated once in (main)/layout.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useProfileContext } from "@/components/providers/ProfileProvider";

export function useProfile() {
  return useProfileContext();
}
