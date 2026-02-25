// ──────────────────────────────────────────────────
// Sprint 5 — Test Page for Catalog Components
// Delete this page after verification!
// ──────────────────────────────────────────────────

import MediaRow from "@/components/catalog/MediaRow";
import MediaGrid from "@/components/catalog/MediaGrid";
import CardSkeletonRow from "@/components/catalog/CardSkeletonRow";
import type { MovieSummary, TVShowSummary } from "@/types";

// ── Mock data ────────────────────────────────────
const mockMovies: MovieSummary[] = Array.from({ length: 6 }, (_, i) => ({
  id: 550 + i,
  title: ["Fight Club", "The Dark Knight", "Inception", "Interstellar", "Parasite", "Joker"][i],
  overview: "Una sinopsis de prueba para verificar el grid de películas.",
  poster_path: [
    "/pB8BM7pdSp6B6Ih7QI4S2t0PODy.jpg",
    "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    "/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  ][i],
  backdrop_path: null,
  release_date: `202${i}-01-01`,
  vote_average: 7.5 + i * 0.2,
  vote_count: 1000,
  genre_ids: [28, 18],
  media_type: "movie",
}));

const mockTV: TVShowSummary[] = Array.from({ length: 6 }, (_, i) => ({
  id: 1396 + i,
  name: ["Breaking Bad", "The Wire", "Sopranos", "Chernobyl", "Succession", "True Detective"][i],
  overview: "Una sinopsis de prueba para series.",
  poster_path: [
    "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    "/4lbclFySvugI51fwsyxBTOm4DqK.jpg",
    null,
    "/hlLXt2tOPy1e7H3h7Nw8Rl9CLDE.jpg",
    null,
    "/y3EsNpMFwvpcucLfG3Ew4gqeEP4.jpg",
  ][i],
  backdrop_path: null,
  first_air_date: `201${i}-01-01`,
  vote_average: 8.0 + i * 0.15,
  vote_count: 2000,
  genre_ids: [18],
  media_type: "tv",
}));

const allItems = [...mockMovies, ...mockTV];

export default function TestCatalogPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary pt-20">
      <div className="sticky top-16 z-40 bg-surface/90 backdrop-blur-md border-b border-border px-4 lg:px-12 py-3">
        <h1 className="text-xl font-bold text-accent-primary">
          Sprint 5 — Catalog Components Test
        </h1>
        <p className="text-xs text-text-muted">Eliminar después de verificar</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-12 py-12 space-y-16">
        {/* 5.1 + 5.2 — MediaCard + MediaRow */}
        <section>
          <h2 className="text-lg font-semibold text-text-secondary mb-6 pb-2 border-b border-border">
            5.1 + 5.2 — MediaCard + MediaRow (Movies)
          </h2>
          <MediaRow title="Películas populares" items={mockMovies} seeAllHref="/movies" />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-secondary mb-6 pb-2 border-b border-border">
            5.2 — MediaRow (TV Shows)
          </h2>
          <MediaRow title="Series populares" items={mockTV} />
        </section>

        {/* 5.3 — CardSkeletonRow */}
        <section>
          <h2 className="text-lg font-semibold text-text-secondary mb-6 pb-2 border-b border-border">
            5.3 — CardSkeletonRow (Suspense fallback)
          </h2>
          <CardSkeletonRow title="Tendencias" />
        </section>

        {/* 5.4 — MediaGrid (search) */}
        <section>
          <h2 className="text-lg font-semibold text-text-secondary mb-6 pb-2 border-b border-border">
            5.4 — MediaGrid (búsqueda mixta)
          </h2>
          <MediaGrid items={allItems.slice(0, 12)} />
        </section>
      </div>
    </div>
  );
}
