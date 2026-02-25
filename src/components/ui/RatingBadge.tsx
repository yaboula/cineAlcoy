// ──────────────────────────────────────────────────
// RatingBadge — TMDB vote average display
// ──────────────────────────────────────────────────

import { Star } from "lucide-react";

interface RatingBadgeProps {
  score: number;
  size?: "sm" | "md";
}

export default function RatingBadge({ score, size = "sm" }: RatingBadgeProps) {
  if (score === 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-rating-star ${
        size === "sm" ? "text-xs" : "text-sm font-medium"
      }`}
    >
      <Star
        className={size === "sm" ? "w-3 h-3" : "w-4 h-4"}
        fill="currentColor"
        aria-hidden
      />
      {score.toFixed(1)}
    </span>
  );
}
