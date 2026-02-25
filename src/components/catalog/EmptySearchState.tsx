// ──────────────────────────────────────────────────
// EmptySearchState — No results placeholder
// Sprint 11
// ──────────────────────────────────────────────────

import { SearchX } from "lucide-react";

interface EmptySearchStateProps {
  query: string;
}

export default function EmptySearchState({ query }: EmptySearchStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center gap-4 animate-fadeIn">
      <SearchX className="w-16 h-16 text-text-muted" strokeWidth={1.2} aria-hidden />
      <h2 className="text-xl font-semibold text-text-primary">
        Sin resultados para &ldquo;{query}&rdquo;
      </h2>
      <p className="text-sm text-text-secondary max-w-md">
        Prueba con otro término de búsqueda o revisa la ortografía.
      </p>
    </div>
  );
}
