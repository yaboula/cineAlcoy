"use client";

// ─────────────────────────────────────────────────────────────────────────────
// useUserStats — watch time, completions, streak
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useProfile } from "./useProfile";
import { getStats, formatWatchTime } from "@/lib/supabase/stats";
import type { UserStats } from "@/lib/supabase/types";

export function useUserStats() {
  const { profile } = useProfile();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    getStats(profile.id)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [profile]);

  const watchTimeFormatted = stats
    ? formatWatchTime(stats.total_watch_seconds)
    : "0 min";

  return { stats, loading, watchTimeFormatted };
}
