// ──────────────────────────────────────────────────
// /watchlist — Mi lista (server wrapper)
// ──────────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import WatchlistPageClient from "@/components/catalog/WatchlistPageClient";

export const metadata: Metadata = {
  title: "Mi lista — Cinema",
  description: "Películas y series guardadas para ver más tarde.",
};

export default function WatchlistPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 lg:px-12 mx-auto max-w-7xl animate-fadeIn">
      <h1 className="text-3xl font-extrabold text-text-primary mb-2 tracking-tight">
        Mi lista
      </h1>
      <p className="text-text-muted text-sm mb-8">
        Todo lo que guardaste para ver después.
      </p>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pt-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-2/3 rounded-xl bg-surface-hover animate-pulse" />
            ))}
          </div>
        }
      >
        <WatchlistPageClient />
      </Suspense>
    </main>
  );
}
