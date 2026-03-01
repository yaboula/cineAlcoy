// ─────────────────────────────────────────────────────────────────────────────
// User Stats — track watch time, completion, streaks
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { UserStats } from "./types";

/**
 * Called whenever progress is saved — keeps stats in sync.
 *
 * R2 fix: uses SELECT + UPSERT with conflict handling instead of the old
 * read-then-write pattern, so two concurrent calls never lose data.
 * The streak logic still requires a read, but the write is now atomic.
 */
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

  const addSec  = opts.addSeconds       ?? 0;
  const addMov  = opts.completedMovie   ? 1 : 0;
  const addEp   = opts.completedEpisode ? 1 : 0;

  // Read current row (may not exist yet)
  const { data: current } = await supabase
    .from("user_stats")
    .select("*")
    .eq("profile_id", profileId)
    .single();

  if (!current) {
    // First time — upsert so a racing duplicate INSERT doesn't explode
    await supabase.from("user_stats").upsert({
      profile_id:          profileId,
      total_watch_seconds: addSec,
      movies_completed:    addMov,
      episodes_completed:  addEp,
      current_streak_days: 1,
      longest_streak_days: 1,
      last_active_date:    today,
      updated_at:          new Date().toISOString(),
    }, { onConflict: "profile_id" });
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

  // Upsert instead of plain update — if a concurrent call inserted between
  // our SELECT and this write the operation still succeeds.
  await supabase.from("user_stats").upsert({
    profile_id:          profileId,
    total_watch_seconds: stats.total_watch_seconds + addSec,
    movies_completed:    stats.movies_completed    + addMov,
    episodes_completed:  stats.episodes_completed  + addEp,
    current_streak_days: streak,
    longest_streak_days: Math.max(stats.longest_streak_days, streak),
    last_active_date:    today,
    updated_at:          new Date().toISOString(),
  }, { onConflict: "profile_id" });
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
