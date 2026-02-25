// ──────────────────────────────────────────────────
// not-found.tsx — Global 404 page
// ──────────────────────────────────────────────────

import Link from "next/link";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6 animate-fadeIn">
      {/* Cinematic icon */}
      <div className="relative">
        <Film className="w-24 h-24 text-surface-hover" strokeWidth={0.8} aria-hidden />
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-text-muted">
          404
        </span>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
          Escena no encontrada
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-md">
          La página que buscas no existe o fue eliminada. Vuelve al inicio para
          seguir explorando el catálogo.
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-primary text-white font-medium text-sm transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-primary/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <Film className="w-4 h-4" aria-hidden />
        Volver al inicio
      </Link>
    </div>
  );
}
