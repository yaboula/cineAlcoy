// ──────────────────────────────────────────────────
// /movies — Movies Category Page
// Sprint 12
// ──────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import { getPopularMovies, getNowPlayingMovies, getTopRatedMovies } from "@/lib/tmdb";
import MediaRow from "@/components/catalog/MediaRow";
import CardSkeletonRow from "@/components/catalog/CardSkeletonRow";
import type { MediaItem } from "@/types";

export const metadata: Metadata = {
  title: "Películas — Cinema",
  description: "Explora las películas más populares, estrenos y mejor valoradas.",
};

async function PopularMoviesSection() {
  const data = await getPopularMovies();
  return <MediaRow title="Populares" items={data.results as MediaItem[]} />;
}

async function NowPlayingSection() {
  const data = await getNowPlayingMovies();
  return <MediaRow title="Estrenos en cines" items={data.results as MediaItem[]} />;
}

async function TopRatedMoviesSection() {
  const data = await getTopRatedMovies();
  return <MediaRow title="Mejor valoradas" items={data.results as MediaItem[]} />;
}

export default function MoviesPage() {
  return (
    <div className="min-h-screen pb-16">
      {/* ── Page Hero ─────────────────────────── */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-accent-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-r from-accent-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="mx-auto max-w-7xl px-4 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-3">Catálogo</p>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-3">Películas</h1>
          <p className="text-text-secondary text-base max-w-lg">
            Populares, estrenos en cartelera y las mejor valoradas de todos los tiempos.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-12 space-y-16">

        <Suspense fallback={<CardSkeletonRow title="Populares" />}>
          <PopularMoviesSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="Estrenos en cines" />}>
          <NowPlayingSection />
        </Suspense>

        <Suspense fallback={<CardSkeletonRow title="Mejor valoradas" />}>
          <TopRatedMoviesSection />
        </Suspense>
      </div>
    </div>
  );
}
