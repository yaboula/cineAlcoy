// ──────────────────────────────────────────────────
// DetailSkeleton — Loading placeholder for Movie/TV detail page
// ──────────────────────────────────────────────────

export default function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Backdrop skeleton */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-surface" />

      {/* Content area */}
      <div className="mx-auto max-w-7xl px-4 lg:px-12 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster sidebar */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="aspect-[2/3] rounded-lg bg-surface-hover" />
          </div>

          {/* Info area */}
          <div className="flex-1 space-y-4 pt-4">
            {/* Title */}
            <div className="h-10 w-3/4 rounded-lg bg-surface-hover" />
            {/* Tagline */}
            <div className="h-4 w-1/2 rounded bg-surface-hover" />
            {/* Genre badges */}
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-surface-hover" />
              <div className="h-6 w-24 rounded-full bg-surface-hover" />
              <div className="h-6 w-16 rounded-full bg-surface-hover" />
            </div>
            {/* Meta line (year, runtime, rating) */}
            <div className="h-4 w-64 rounded bg-surface-hover" />
            {/* Synopsis lines */}
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-surface-hover" />
              <div className="h-4 w-full rounded bg-surface-hover" />
              <div className="h-4 w-5/6 rounded bg-surface-hover" />
              <div className="h-4 w-2/3 rounded bg-surface-hover" />
            </div>
          </div>
        </div>

        {/* Cast section skeleton */}
        <div className="mt-12 space-y-4">
          <div className="h-6 w-32 rounded bg-surface-hover" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shrink-0 space-y-2">
                <div className="w-20 h-20 rounded-full bg-surface-hover" />
                <div className="h-3 w-16 mx-auto rounded bg-surface-hover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
