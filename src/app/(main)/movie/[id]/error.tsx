"use client";

// ──────────────────────────────────────────────────
// /movie/[id]/error.tsx
// ──────────────────────────────────────────────────

import ErrorFallback from "@/components/ui/ErrorFallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MovieError({ reset }: ErrorProps) {
  return (
    <ErrorFallback
      message="No pudimos cargar esta película. Puede ser un problema temporal."
      onRetry={reset}
    />
  );
}
