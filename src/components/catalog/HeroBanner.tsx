// ──────────────────────────────────────────────────
// HeroBanner — Full-bleed hero with backdrop, gradient overlay,
// title, synopsis (truncated) and "Ver ahora" CTA button
// Server Component
// ──────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { getTMDBImageUrl } from "@/lib/utils";
import type { TrendingResult } from "@/types";

interface HeroBannerProps {
  item: TrendingResult;
}

export default function HeroBanner({ item }: HeroBannerProps) {
  const title = item.media_type === "movie" ? item.title : item.name;
  const year =
    item.media_type === "movie"
      ? item.release_date?.substring(0, 4)
      : item.first_air_date?.substring(0, 4);
  const href = item.media_type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
  const backdropUrl = getTMDBImageUrl(item.backdrop_path, "original");

  return (
    <section
      className="relative h-[60vh] md:h-[72vh] lg:h-[86vh] w-full overflow-hidden"
      aria-label={`Hero: ${title}`}
    >
      {/* ── Backdrop image ──────────────────────── */}
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={`Backdrop de ${title}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}

      {/* ── Gradients (cinematic) ───────────────── */}
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-b from-background/40 to-transparent" />

      {/* ── Content ─────────────────────────────── */}
      <div className="absolute bottom-12 md:bottom-20 left-4 lg:left-12 max-w-2xl animate-fadeIn">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest bg-accent-primary text-white px-2.5 py-1 rounded-md">
            {item.media_type === "movie" ? "Película" : "Serie"}
          </span>
          {year && (
            <span className="text-[11px] text-text-muted bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
              {year}
            </span>
          )}
          {item.vote_average > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-rating-star bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
              <Star className="w-3 h-3 fill-current" aria-hidden />
              {item.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
          {title}
        </h1>

        {/* Synopsis */}
        {item.overview && (
          <p className="text-sm md:text-base text-white/70 leading-relaxed mb-8 line-clamp-2 md:line-clamp-3 max-w-xl">
            {item.overview}
          </p>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-accent-primary text-white font-semibold text-sm transition-all hover:bg-accent-hover hover:shadow-2xl hover:shadow-accent-primary/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            Ver ahora
          </Link>
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-sm border border-white/20 transition-all hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            Más info
          </Link>
        </div>
      </div>
    </section>
  );
}
