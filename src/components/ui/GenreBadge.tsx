// ──────────────────────────────────────────────────
// GenreBadge — Genre tag pill
// ──────────────────────────────────────────────────

interface GenreBadgeProps {
  name: string;
}

export default function GenreBadge({ name }: GenreBadgeProps) {
  return (
    <span className="inline-block text-xs font-medium px-3 py-1 rounded-full border border-border text-text-secondary bg-surface/60 backdrop-blur-sm transition-colors hover:border-accent-primary/50 hover:text-text-primary">
      {name}
    </span>
  );
}
