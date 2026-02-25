"use client";

// ──────────────────────────────────────────────────
// ErrorFallback — Error boundary UI with retry/home actions
// ──────────────────────────────────────────────────

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorFallbackProps {
  message: string;
  onRetry: () => void;
  showHomeLink?: boolean;
}

export default function ErrorFallback({
  message,
  onRetry,
  showHomeLink = true,
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-5 px-4 text-center animate-fadeIn">
      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden />
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-text-primary">Algo salió mal</h2>

      {/* Description */}
      <p className="text-sm text-text-secondary max-w-md">{message}</p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-primary/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
          Intentar de nuevo
        </button>

        {showHomeLink && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-text-secondary text-sm font-medium transition-all hover:border-text-muted hover:text-text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            <Home className="w-4 h-4" aria-hidden />
            Ir al inicio
          </Link>
        )}
      </div>
    </div>
  );
}
