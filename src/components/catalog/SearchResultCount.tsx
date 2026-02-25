// ──────────────────────────────────────────────────
// SearchResultCount — Badge showing result count
// Sprint 11
// ──────────────────────────────────────────────────

interface SearchResultCountProps {
  count: number;
  query: string;
}

export default function SearchResultCount({ count, query }: SearchResultCountProps) {
  return (
    <p className="text-sm text-text-secondary">
      <span className="font-semibold text-text-primary">{count.toLocaleString()}</span>{" "}
      resultado{count !== 1 ? "s" : ""} para{" "}
      <span className="text-accent-primary font-medium">&ldquo;{query}&rdquo;</span>
    </p>
  );
}
