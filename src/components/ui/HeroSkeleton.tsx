// ──────────────────────────────────────────────────
// HeroSkeleton — Loading placeholder for Hero Banner
// ──────────────────────────────────────────────────

export default function HeroSkeleton() {
  return (
    <div className="relative h-[50vh] md:h-[60vh] lg:h-[80vh] w-full animate-pulse bg-surface">
      {/* Content placeholder at bottom-left */}
      <div className="absolute bottom-12 left-4 lg:left-12 space-y-4">
        {/* Title */}
        <div className="h-10 w-72 md:w-96 rounded-lg bg-surface-hover" />
        {/* Subtitle lines */}
        <div className="h-4 w-64 md:w-80 rounded bg-surface-hover" />
        <div className="h-4 w-48 md:w-64 rounded bg-surface-hover" />
        {/* CTA button */}
        <div className="h-12 w-36 rounded-lg bg-surface-hover" />
      </div>
    </div>
  );
}
