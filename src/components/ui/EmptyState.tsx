// ──────────────────────────────────────────────────
// EmptyState — Reusable empty/no-results placeholder
// ──────────────────────────────────────────────────

import { type ReactNode } from "react";
import Link from "next/link";
import { Clapperboard } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fadeIn">
      {/* Icon */}
      <div className="mb-6 text-text-muted">
        {icon ?? <Clapperboard className="w-16 h-16" strokeWidth={1.2} aria-hidden />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>

      {/* CTA Button */}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-primary/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
