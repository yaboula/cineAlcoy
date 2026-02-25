// ──────────────────────────────────────────────────
// EpisodeRowSkeleton — Loading placeholder for episode list
// ──────────────────────────────────────────────────

interface EpisodeRowSkeletonProps {
  count?: number;
}

export default function EpisodeRowSkeleton({ count = 5 }: EpisodeRowSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 h-16 rounded-lg bg-surface px-4"
        >
          {/* Episode number */}
          <div className="h-4 w-6 rounded bg-surface-hover shrink-0" />
          {/* Still image */}
          <div className="h-10 w-16 rounded bg-surface-hover shrink-0" />
          {/* Text lines */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-surface-hover" />
            <div className="h-3 w-2/3 rounded bg-surface-hover" />
          </div>
          {/* Duration */}
          <div className="h-3 w-10 rounded bg-surface-hover shrink-0" />
        </div>
      ))}
    </div>
  );
}
