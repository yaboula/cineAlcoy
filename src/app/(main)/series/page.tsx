// ──────────────────────────────────────────────────
// /series — TV Series Category Page
// Sprint 12
// ──────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import { getPopularTVShows, getOnTheAirTVShows, getTopRatedTVShows } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import CardSkeletonRow from "@/components/catalog/CardSkeletonRow";
import type { MediaItem } from "@/types";

export const metadata: Metadata = {
  title: "Series — Cinema",
  description: "Explora las series más populares, en emisión y mejor valoradas.",
};

async function PopularTVSection() {
  const data = await getPopularTVShows();
  return <MediaRow title="Populares" items={data.results as MediaItem[]} />;
}

async function OnTheAirSection() {
  const data = await getOnTheAirTVShows();
  return <MediaRow title="En emisión" items={data.results as MediaItem[]} />;
}

async function TopRatedTVSection() {
  const data = await getTopRatedTVShows();
  return <MediaRow title="Mejor valoradas" items={data.results as MediaItem[]} />;
}

export default function SeriesPage() {
  return (
    <div className="min-h-screen pb-16">
      {/* ── Page Hero ─────────────────────────── */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-accent-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-r from-accent-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-3">Catálogo</p>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">Series</h1>
          <p className="text-text-secondary text-base max-w-lg">
            Populares, en emisión ahora mismo y las mejor valoradas de la historia.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-12 space-y-16">

        <Suspense fallback={<CardSkeletonRow title="Populares" />}>
          <PopularTVSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="En emisión" />}>
          <OnTheAirSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="Mejor valoradas" />}>
          <TopRatedTVSection />
        </Suspense>
      </div>
    </div>
  );
}
