"use client";

// ─────────────────────────────────────────────────────────────────────────────
// UserStatsPanel — watch time, streak, completions overview
// ─────────────────────────────────────────────────────────────────────────────

import { Clock, Flame, Film, Tv2, TrendingUp } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useSmartSuggestions } from "@/hooks/useSmartSuggestions";
import { cn } from "@/lib/utils";

export default function UserStatsPanel({ className }: { className?: string }) {
  const { stats, watchTimeFormatted, loading: statsLoading } = useUserStats();
  const { topGenres, loading: genreLoading }                 = useSmartSuggestions();

  if (statsLoading || genreLoading) {
    return (
      <div className={cn("rounded-2xl bg-surface border border-border p-5 animate-pulse space-y-3", className)}>
        <div className="h-4 w-32 rounded bg-surface-hover" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-hover" />
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    {
      icon: Clock,
      label: "Tiempo viendo",
      value: watchTimeFormatted,
      color: "text-blue-400",
    },
    {
      icon: Flame,
      label: "Racha actual",
      value: `${stats?.current_streak_days ?? 0} días`,
      color: "text-orange-400",
    },
    {
      icon: Film,
      label: "Películas",
      value: stats?.movies_completed ?? 0,
      color: "text-purple-400",
    },
    {
      icon: Tv2,
      label: "Episodios",
      value: stats?.episodes_completed ?? 0,
      color: "text-green-400",
    },
  ];

  return (
    <div className={cn("rounded-2xl bg-surface border border-border p-5 space-y-5", className)}>
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-widest">
        Mis estadísticas
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {statItems.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="flex flex-col gap-1 rounded-xl bg-surface-hover p-3"
          >
            <Icon className={cn("w-4 h-4", color)} aria-hidden />
            <span className="text-lg font-bold text-text-primary">{value}</span>
            <span className="text-xs text-text-muted">{label}</span>
          </div>
        ))}
      </div>

      {topGenres.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
            <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            Géneros favoritos
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topGenres.map((g, i) => (
              <span
                key={g.genre_id}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                  i === 0
                    ? "bg-accent-primary/15 border-accent-primary/40 text-accent-primary"
                    : "bg-surface border-border text-text-secondary"
                )}
              >
                {g.genre_name}
                <span className="ml-1 opacity-60">×{g.watch_count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {stats && stats.longest_streak_days > 1 && (
        <p className="text-xs text-text-muted">
          Racha máxima: <span className="font-semibold text-text-secondary">{stats.longest_streak_days} días</span>
        </p>
      )}
    </div>
  );
}
