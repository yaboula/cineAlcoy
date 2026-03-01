// ──────────────────────────────────────────────────
// MovieHero — Full-bleed backdrop with gradient overlay
// Works for both movies and TV shows via HeroMedia interface
// Server Component
// ──────────────────────────────────────────────────

import Image from "next/image";
import { getTMDBImageUrl } from "@/lib/utils";

/** Minimal shape needed for the hero backdrop — works for movies and TV shows */
interface HeroMedia {
  title?: string;
  name?: string;
  backdrop_path: string | null;
}

interface MovieHeroProps {
  movie: HeroMedia;
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");
  const displayTitle = movie.title ?? movie.name ?? "";

  return (
    <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={`Backdrop de ${displayTitle}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-surface" />
      )}
      {/* Multi-layer gradient for depth */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
