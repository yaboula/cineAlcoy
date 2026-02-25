// ─────────────────────────────────────────────────────────────────────────────
// User Stats — track watch time, completion, streaks
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { UserStats } from "./types";

/** Called whenever progress is saved — keeps stats in sync */
export async function updateStats(
  profileId: string,
  opts: {
    addSeconds?: number;
    completedMovie?: boolean;
    completedEpisode?: boolean;
  }
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const { data: current } = await supabase
    .from("user_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (!current) {
    // First time — create row
    await supabase.from("user_stats").insert({
      profile_id:          profileId,
      total_watch_seconds: opts.addSeconds      ?? 0,
      movies_completed:    opts.completedMovie  ? 1 : 0,
      episodes_completed:  opts.completedEpisode ? 1 : 0,
      current_streak_days: 1,
      longest_streak_days: 1,
      last_active_date:    today,
    });
    return;
  }

  const stats = current as UserStats;
  const lastDate = stats.last_active_date;

  // Calculate streak
  let streak = stats.current_streak_days;
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    streak = lastDate === yesterdayStr ? streak + 1 : 1;
  }

  await supabase.from("user_stats").update({
    total_watch_seconds: stats.total_watch_seconds + (opts.addSeconds ?? 0),
    movies_completed:    stats.movies_completed    + (opts.completedMovie    ? 1 : 0),
    episodes_completed:  stats.episodes_completed  + (opts.completedEpisode  ? 1 : 0),
    current_streak_days: streak,
    longest_streak_days: Math.max(stats.longest_streak_days, streak),
    last_active_date:    today,
    updated_at:          new Date().toISOString(),
  }).eq("profile_id", profileId);
}

export async function getStats(profileId: string): Promise<UserStats | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("user_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();
  return (data as unknown as UserStats) ?? null;
}

/** Human-readable helpers */
export function formatWatchTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h >= 1) return `${h}h ${m}m`;
  return `${m} min`;
}
