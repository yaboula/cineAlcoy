// ──────────────────────────────────────────────────
// CardSkeletonRow — Suspense fallback for MediaRow sections
// ──────────────────────────────────────────────────

import CardSkeleton from "@/components/ui/CardSkeleton";

interface CardSkeletonRowProps {
  title?: string;
  count?: number;
}

export default function CardSkeletonRow({
  title,
  count = 6,
}: CardSkeletonRowProps) {
  return (
    <section aria-label={title ?? "Cargando..."} aria-busy>
      {/* Section title skeleton */}
      <div className="h-7 w-48 rounded-lg bg-surface animate-pulse mb-5" />

      {/* Cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
