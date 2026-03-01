"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileDashboardClient — Full user dashboard page
//
// Sections:
//   1. Profile header (editable name + emoji avatar)
//   2. Stats overview (watch time, streak, completions, top genres)
//   3. Full watch history grid with filters and remove action
//
// Sprint R4
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import { Clock, Flame, Film, Tv2, TrendingUp, History } from "lucide-react";
import { useProfileContext } from "@/components/providers/ProfileProvider";
import ProfileEditor from "@/components/catalog/ProfileEditor";
import WatchHistoryGrid from "@/components/catalog/WatchHistoryGrid";
import { getStats, formatWatchTime } from "@/lib/supabase/stats";
import { getWatchHistory } from "@/lib/supabase/watch-history";
import { getTopGenres } from "@/lib/supabase/genres";
import { cn } from "@/lib/utils";
import type { Profile, UserStats, WatchHistoryRow, GenrePreference } from "@/lib/supabase/types";

export default function ProfileDashboardClient() {
  const { profile: ctxProfile, loading: profileLoading } = useProfileContext();

  // Local mutable copy so edits propagate instantly
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<WatchHistoryRow[]>([]);
  const [topGenres, setTopGenres] = useState<GenrePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(false);

  useEffect(() => {
    // Still waiting for profile
    if (profileLoading) return;

    // Profile failed to load (no Supabase / env vars missing)
    if (!ctxProfile) {
      setLoading(false);
      setDataError(true);
      return;
    }

    setProfile(ctxProfile);

    Promise.all([
      getStats(ctxProfile.id),
      getWatchHistory(ctxProfile.id, 200),
      getTopGenres(ctxProfile.id, 8),
    ])
      .then(([s, h, g]) => {
        setStats(s);
        setHistory(h);
        setTopGenres(g);
      })
      .catch(() => setDataError(true))
      .finally(() => setLoading(false));
  }, [ctxProfile, profileLoading]);

  const handleProfileUpdate = useCallback(
    (changes: Partial<Pick<Profile, "display_name" | "avatar_emoji">>) => {
      setProfile((prev) => (prev ? { ...prev, ...changes } : prev));
    },
    []
  );

  const handleRemoveHistory = useCallback(
    (tmdbId: number, mediaType: "movie" | "tv") => {
      setHistory((prev) =>
        prev.filter((i) => !(i.tmdb_id === tmdbId && i.media_type === mediaType))
      );
    },
    []
  );

  // ── Error state ──
  if (!loading && (dataError || !profile)) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="text-5xl">⚠️</span>
        <p className="text-text-primary font-medium text-lg">No se pudo cargar el perfil</p>
        <p className="text-text-secondary text-sm max-w-xs">
          Comprueba que las variables de entorno de Supabase están configuradas y recarga la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-primary/80 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Loading state ──
  if (profileLoading || loading || !profile) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-surface-hover animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-lg bg-surface-hover animate-pulse" />
            <div className="h-4 w-28 rounded bg-surface-hover animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-surface-hover animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Stats cards data ──
  const watchTimeFormatted = stats ? formatWatchTime(stats.total_watch_seconds) : "0 min";

  const statItems = [
    {
      icon: Clock,
      label: "Tiempo viendo",
      value: watchTimeFormatted,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      icon: Flame,
      label: "Racha actual",
      value: `${stats?.current_streak_days ?? 0} días`,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
    {
      icon: Film,
      label: "Películas vistas",
      value: stats?.movies_completed ?? 0,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      icon: Tv2,
      label: "Episodios vistos",
      value: stats?.episodes_completed ?? 0,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ═══════════════════════════════════════════════════════════════════
          Section 1: Profile Header
          ═══════════════════════════════════════════════════════════════════ */}
      <ProfileEditor profile={profile} onUpdate={handleProfileUpdate} />

      {/* ═══════════════════════════════════════════════════════════════════
          Section 2: Stats Overview
          ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Estadísticas">
        <h2 className="text-lg font-bold text-text-primary tracking-tight mb-4 pl-3 border-l-2 border-accent-primary">
          Estadísticas
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map(({ icon: Icon, label, value, color, bgColor }) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-xl bg-surface border border-border p-4 hover:border-border/80 transition-colors"
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bgColor)}>
                <Icon className={cn("w-4.5 h-4.5", color)} aria-hidden />
              </div>
              <span className="text-2xl font-bold text-text-primary tabular-nums">
                {value}
              </span>
              <span className="text-xs text-text-muted">{label}</span>
            </div>
          ))}
        </div>

        {/* Top genres */}
        {topGenres.length > 0 && (
          <div className="mt-5 rounded-xl bg-surface border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent-primary" aria-hidden />
              <h3 className="text-sm font-semibold text-text-secondary">Géneros favoritos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {topGenres.map((g, i) => (
                <span
                  key={g.genre_id}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    i === 0
                      ? "bg-accent-primary/15 border-accent-primary/40 text-accent-primary"
                      : i < 3
                        ? "bg-surface-hover border-border text-text-primary"
                        : "bg-surface border-border text-text-secondary"
                  )}
                >
                  {g.genre_name}
                  <span className="ml-1.5 opacity-50">×{g.watch_count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Longest streak callout */}
        {stats && stats.longest_streak_days > 1 && (
          <p className="text-xs text-text-muted mt-3 pl-1">
            Racha máxima alcanzada:{" "}
            <span className="font-semibold text-text-secondary">{stats.longest_streak_days} días</span>
          </p>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          Section 3: Watch History
          ═══════════════════════════════════════════════════════════════════ */}
      <section aria-label="Historial de visualización">
        <div className="flex items-center gap-2 mb-5">
          <History className="w-5 h-5 text-accent-primary" aria-hidden />
          <h2 className="text-lg font-bold text-text-primary tracking-tight pl-3 border-l-2 border-accent-primary">
            Historial
          </h2>
        </div>

        <WatchHistoryGrid
          items={history}
          profileId={profile.id}
          onRemove={handleRemoveHistory}
        />
      </section>
    </div>
  );
}
