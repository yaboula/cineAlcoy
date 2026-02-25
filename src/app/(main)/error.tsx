"use client";

// ──────────────────────────────────────────────────
// (main)/error.tsx — Catches errors in the main catalog routes
// ──────────────────────────────────────────────────

import ErrorFallback from "../../components/ui/ErrorFallback";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ reset }: ErrorPageProps) {
  return (
    <ErrorFallback
      message="No pudimos cargar el catálogo. Esto puede deberse a un problema temporal con nuestro proveedor de datos."
      onRetry={reset}
      showHomeLink={true}
    />
  );
}
