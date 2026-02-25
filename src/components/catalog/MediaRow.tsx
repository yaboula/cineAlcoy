// ──────────────────────────────────────────────────
// MediaRow — Horizontal section with title + responsive grid
// ──────────────────────────────────────────────────

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import MediaCard from "@/components/catalog/MediaCard";
import type { MediaItem } from "@/types";

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  /** Optional link to a "See all" page */
  seeAllHref?: string;
}

export default function MediaRow({ title, items, seeAllHref }: MediaRowProps) {
  if (items.length === 0) return null;

  return (
    <section aria-label={title}>
      {/* ── Section header ──────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-text-primary tracking-tight pl-3 border-l-2 border-accent-primary">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-accent-primary border border-border hover:border-accent-primary/50 rounded-full px-3 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            Ver todo
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* ── Responsive card grid ─────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
