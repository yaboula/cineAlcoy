// ──────────────────────────────────────────────────
// CardSkeleton — Loading placeholder for MediaCards
// ──────────────────────────────────────────────────

export default function CardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Poster placeholder */}
      <div className="aspect-2/3 rounded-lg bg-surface" />
      {/* Title line */}
      <div className="mt-3 h-4 w-3/4 rounded bg-surface" />
      {/* Subtitle line (year + rating) */}
      <div className="mt-2 h-3 w-1/2 rounded bg-surface" />
    </div>
  );
}
