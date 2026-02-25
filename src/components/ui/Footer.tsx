// ──────────────────────────────────────────────────
// Footer — Legal disclaimer, links, and copyright
// ──────────────────────────────────────────────────

import Link from "next/link";
import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-12 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* ── Brand ─────────────────────────────── */}
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-accent-primary" aria-hidden />
            <span className="text-sm font-semibold text-text-primary">Cinema</span>
          </div>

          {/* ── Disclaimer ────────────────────────── */}
          <p className="text-xs text-text-muted max-w-md md:text-center leading-relaxed">
            Cinema no aloja ni almacena contenido. Todos los datos del catálogo
            provienen de{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-accent-primary transition-colors underline-offset-2 hover:underline"
            >
              TMDB
            </a>
            . La reproducción es proporcionada por fuentes externas.
          </p>

          {/* ── Links + Copyright ─────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-text-muted">
            <div className="flex items-center gap-4">
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-secondary transition-colors"
              >
                TMDB
              </a>
              <Link href="/search" className="hover:text-text-secondary transition-colors">
                Buscar
              </Link>
            </div>
            <span className="hidden sm:inline text-border">|</span>
            <span>© 2026 Cinema</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
