"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useProfile — loads/creates the device profile on mount
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { getOrCreateProfile } from "@/lib/supabase/profile";
import type { Profile } from "@/lib/supabase/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading };
}
