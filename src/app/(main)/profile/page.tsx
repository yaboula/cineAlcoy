// ──────────────────────────────────────────────────
// /profile — User Dashboard (server wrapper)
// Sprint R4
// ──────────────────────────────────────────────────

import type { Metadata } from "next";
import { Suspense } from "react";
import ProfileDashboardClient from "@/components/catalog/ProfileDashboardClient";

export const metadata: Metadata = {
  title: "Mi perfil — Cinema",
  description: "Estadísticas, historial de visualización y preferencias.",
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 lg:px-12 mx-auto max-w-7xl animate-fadeIn">
      <Suspense
        fallback={
          <div className="space-y-8">
            {/* Profile header skeleton */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-surface-hover animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-40 rounded-lg bg-surface-hover animate-pulse" />
                <div className="h-4 w-28 rounded bg-surface-hover animate-pulse" />
              </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-surface-hover animate-pulse" />
              ))}
            </div>
            {/* History skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-2/3 rounded-xl bg-surface-hover animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        <ProfileDashboardClient />
      </Suspense>
    </main>
  );
}
