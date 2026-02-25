"use client";

// ──────────────────────────────────────────────────
// MediaTypeFilter — Animated tab bar for filtering
// search results by media type
// ──────────────────────────────────────────────────

import { motion } from "framer-motion";
import { Film, Tv, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaFilter = "all" | "movie" | "tv";

interface MediaTypeFilterProps {
  active: MediaFilter;
  onChange: (filter: MediaFilter) => void;
  counts: { all: number; movie: number; tv: number };
}

const TABS: { value: MediaFilter; label: string; icon: typeof Film }[] = [
  { value: "all", label: "Todo", icon: LayoutGrid },
  { value: "movie", label: "Películas", icon: Film },
  { value: "tv", label: "Series", icon: Tv },
];

export default function MediaTypeFilter({
  active,
  onChange,
  counts,
}: MediaTypeFilterProps) {
  return (
    <div
      className="flex items-center gap-1 p-1 bg-surface rounded-xl border border-border"
      role="tablist"
      aria-label="Filtrar por tipo de contenido"
    >
      {TABS.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;
        const count = counts[value];
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              isActive
                ? "text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="media-filter-active"
                className="absolute inset-0 rounded-lg bg-accent-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-4 h-4" aria-hidden />
              {label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive ? "text-white/70" : "text-text-muted"
                )}
              >
                {count.toLocaleString()}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
