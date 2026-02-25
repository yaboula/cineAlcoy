// ──────────────────────────────────────────────────
// (main)/loading.tsx — Global loading skeleton
// ──────────────────────────────────────────────────

import HeroSkeleton from "../../components/ui/HeroSkeleton";
import CardSkeleton from "../../components/ui/CardSkeleton";

export default function MainLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="mx-auto max-w-7xl px-4 lg:px-12 py-12 space-y-12">
        {[0, 1, 2].map((row) => (
          <section key={row}>
            {/* Section title skeleton */}
            <div className="h-7 w-48 rounded-lg bg-surface animate-pulse mb-5" />
            {/* Cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
