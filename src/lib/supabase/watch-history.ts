// ─────────────────────────────────────────────────────────────────────────────
// Watch History & Progress — save/read viewing progress per item
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { WatchHistoryRow, MediaType } from "./types";

export interface ProgressInput {
  profileId: string;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  genreIds?: number[];
  releaseYear?: number | null;
  progressSeconds: number;
  durationSeconds?: number;
  completed?: boolean;
  // TV only
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
}

/** Save (upsert) viewing progress. Safe to call every 10 s during playback. */
export async function saveProgress(input: ProgressInput): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  // Fetch current row to accumulate total_watch_seconds
  const { data: existing } = await supabase
    .from("watch_history")
    .select("progress_seconds, total_watch_seconds, first_watched_at")
    .eq("profile_id", input.profileId)
    .eq("tmdb_id", input.tmdbId)
    .eq("media_type", input.mediaType)
    .single();

  const prevProgress = existing?.progress_seconds ?? 0;
  const prevTotal    = existing?.total_watch_seconds ?? 0;
  const delta        = Math.max(0, input.progressSeconds - prevProgress);

  await supabase.from("watch_history").upsert(
    {
      profile_id:          input.profileId,
      tmdb_id:             input.tmdbId,
      media_type:          input.mediaType,
      title:               input.title,
      poster_path:         input.posterPath   ?? null,
      backdrop_path:       input.backdropPath ?? null,
      genre_ids:           input.genreIds     ?? [],
      release_year:        input.releaseYear  ?? null,
      progress_seconds:    input.progressSeconds,
      duration_seconds:    input.durationSeconds ?? 0,
      completed:           input.completed ?? false,
      season_number:       input.seasonNumber  ?? null,
      episode_number:      input.episodeNumber ?? null,
      episode_title:       input.episodeTitle  ?? null,
      last_watched_at:     new Date().toISOString(),
      first_watched_at:    existing?.first_watched_at ?? new Date().toISOString(),
      total_watch_seconds: prevTotal + delta,
    },
    { onConflict: "profile_id,tmdb_id,media_type" }
  );
}

/** Get the saved progress for one item (to resume from) */
export async function getProgress(
  profileId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<Pick<WatchHistoryRow, "progress_seconds" | "duration_seconds" | "completed" | "season_number" | "episode_number"> | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("watch_history")
    .select("progress_seconds, duration_seconds, completed, season_number, episode_number")
    .eq("profile_id", profileId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType)
    .single();

  return data ?? null;
}

/** Get the full watch history list (most recent first) */
export async function getWatchHistory(
  profileId: string,
  limit = 40
): Promise<WatchHistoryRow[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("profile_id", profileId)
    .order("last_watched_at", { ascending: false })
    .limit(limit);

  return (data as WatchHistoryRow[]) ?? [];
}

/** Get in-progress items (not completed, >5% watched) for "Continue Watching" */
export async function getContinueWatching(
  profileId: string,
  limit = 20
): Promise<WatchHistoryRow[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("watch_history")
    .select("*")
    .eq("profile_id", profileId)
    .eq("completed", false)
    .gt("progress_seconds", 60)          // at least 1 min in
    .order("last_watched_at", { ascending: false })
    .limit(limit);

  return (data as WatchHistoryRow[]) ?? [];
}

/** Remove one item from history */
export async function removeFromHistory(
  profileId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  await supabase
    .from("watch_history")
    .delete()
    .eq("profile_id", profileId)
    .eq("tmdb_id", tmdbId)
    .eq("media_type", mediaType);
}
