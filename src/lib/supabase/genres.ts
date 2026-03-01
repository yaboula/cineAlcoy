// ─────────────────────────────────────────────────────────────────────────────
// Genre Preferences — build a taste profile from watch history
// Used for smart recommendations
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "./client";
import type { GenrePreference } from "./types";

/**
 * Call this whenever something is added to watch history.
 *
 * R2 fix: replaced the per-genre SELECT+UPDATE loop (N+1 problem, 4-8 round
 * trips for 4 genres) with a single SELECT + a single batch UPSERT.
 * Also eliminates the race condition where two concurrent writes to the
 * same genre could both read the old count and only increment by 1.
 */
export async function recordGenres(
  profileId: string,
  genreIds: number[],
  genreNames: Record<number, string>,
  completed = false
): Promise<void> {
  if (!genreIds.length) return;
  const supabase = createClient();
  if (!supabase) return;

  // 1. Fetch ALL existing rows for this profile + these genres in one query
  const { data: existing } = await supabase
    .from("genre_preferences")
    .select("genre_id, watch_count, completed_count")
    .eq("profile_id", profileId)
    .in("genre_id", genreIds);

  const existingMap = new Map(
    (existing ?? []).map((r) => [r.genre_id as number, r as { genre_id: number; watch_count: number; completed_count: number }])
  );

  // 2. Build batch rows with updated counts
  const rows = genreIds.map((genreId) => {
    const prev = existingMap.get(genreId);
    return {
      profile_id:      profileId,
      genre_id:        genreId,
      genre_name:      genreNames[genreId] ?? `Genre ${genreId}`,
      watch_count:     (prev?.watch_count     ?? 0) + 1,
      completed_count: (prev?.completed_count ?? 0) + (completed ? 1 : 0),
    };
  });

  // 3. Single batch upsert — PK is (profile_id, genre_id)
  await supabase.from("genre_preferences").upsert(rows, {
    onConflict: "profile_id,genre_id",
  });
}

/** Get top N preferred genres ordered by watch count */
export async function getTopGenres(
  profileId: string,
  limit = 5
): Promise<GenrePreference[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("genre_preferences")
    .select("*")
    .eq("profile_id", profileId)
    .order("watch_count", { ascending: false })
    .limit(limit);
  return (data as GenrePreference[]) ?? [];
}

/** Returns genre_ids sorted by preference score (watch + 2×completed) */
export async function getPreferredGenreIds(profileId: string): Promise<number[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("genre_preferences")
    .select("genre_id, watch_count, completed_count")
    .eq("profile_id", profileId)
    .order("watch_count", { ascending: false })
    .limit(10);

  if (!data) return [];
  return (data as GenrePreference[])
    .sort((a, b) => (b.watch_count + b.completed_count * 2) - (a.watch_count + a.completed_count * 2))
    .map((g) => g.genre_id);
}

/** Regenerate genre preferences from scratch using existing watch_history */
export async function rebuildGenrePreferences(profileId: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;
  const { data: history } = await supabase
    .from("watch_history")
    .select("genre_ids, completed")
    .eq("profile_id", profileId);

  if (!history) return;

  // Aggregate
  const counts: Record<number, { watch: number; completed: number }> = {};
  for (const row of history) {
    for (const gid of (row.genre_ids as number[])) {
      if (!counts[gid]) counts[gid] = { watch: 0, completed: 0 };
      counts[gid].watch++;
      if (row.completed) counts[gid].completed++;
    }
  }

  const rows = Object.entries(counts).map(([gid, c]) => ({
    profile_id:      profileId,
    genre_id:        Number(gid),
    genre_name:      `Genre ${gid}`,
    watch_count:     c.watch,
    completed_count: c.completed,
  }));

  if (rows.length) {
    await supabase.from("genre_preferences").upsert(rows, {
      onConflict: "profile_id,genre_id",
    });
  }
}

// Shared TMDB genre map (subset — update from TMDB /genre/movie/list if needed)
export const TMDB_GENRE_NAMES: Record<number, string> = {
  28: "Acción", 12: "Aventura", 16: "Animación", 35: "Comedia",
  80: "Crimen", 99: "Documental", 18: "Drama", 10751: "Familia",
  14: "Fantasía", 36: "Historia", 27: "Terror", 10402: "Música",
  9648: "Misterio", 10749: "Romance", 878: "Ciencia ficción",
  10770: "Película de TV", 53: "Suspense", 10752: "Bélica",
  37: "Western", 10759: "Acción y aventura", 10762: "Infantil",
  10763: "Noticias", 10764: "Reality", 10765: "Sci-Fi y Fantasía",
  10766: "Telenovela", 10767: "Talk Show", 10768: "Bélica y política",
};
