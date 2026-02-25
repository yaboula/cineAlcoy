// ──────────────────────────────────────────────────
// Homepage — Sprint 6
// Assembles all async sections with independent Suspense boundaries
// ──────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";

import CardSkeletonRow from "@/components/catalog/CardSkeletonRow";
import HeroSkeleton from "@/components/ui/HeroSkeleton";
import TrendingSection from "@/components/catalog/TrendingSection";
import NowPlayingSection from "@/components/catalog/NowPlayingSection";
import TopRatedSection from "@/components/catalog/TopRatedSection";
import PopularTVSection from "@/components/catalog/PopularTVSection";
import ContinueWatchingRow from "@/components/catalog/ContinueWatchingRow";

export const metadata: Metadata = {
  title: "Cinema — Descubre y reproduce películas y series",
  description:
    "Explora el catálogo de películas y series más completo. Busca, descubre y reproduce contenido al instante.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero + Trending ──────────────────────── */}
      <Suspense fallback={<HeroSkeleton />}>
        <TrendingSection />
      </Suspense>

      {/* ── Bottom sections ──────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 lg:px-12 py-12 space-y-14">
        {/* ── Watch history (client, hidden when empty) */}
        <ContinueWatchingRow />

        <Suspense fallback={<CardSkeletonRow title="Estrenos en cines" />}>
          <NowPlayingSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="Mejor valoradas" />}>
          <TopRatedSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="Series populares" />}>
          <PopularTVSection />
        </Suspense>
      </div>
    </div>
  );
}
