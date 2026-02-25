"use client";

// ──────────────────────────────────────────────────
// LoadMoreButton — Paginated "Load More" with loading state
// ──────────────────────────────────────────────────

import { Loader2 } from "lucide-react";

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
  hasMore: boolean;
}

export default function LoadMoreButton({
  onClick,
  isLoading,
  hasMore,
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-8 pb-4">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border border-border text-text-secondary text-sm font-medium transition-all hover:border-accent-primary/50 hover:text-text-primary hover:shadow-lg hover:shadow-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            Cargando...
          </>
        ) : (
          "Cargar más"
        )}
      </button>
    </div>
  );
}
