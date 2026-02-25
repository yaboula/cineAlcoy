// ──────────────────────────────────────────────────
// MovieHero — Full-bleed backdrop with gradient overlay for /movie/[id]
// Server Component
// ──────────────────────────────────────────────────

import Image from "next/image";
import { getTMDBImageUrl } from "@/lib/utils";
import type { MovieDetail } from "@/types";

interface MovieHeroProps {
  movie: MovieDetail;
}

export default function MovieHero({ movie }: MovieHeroProps) {
  const backdropUrl = getTMDBImageUrl(movie.backdrop_path, "original");

  return (
    <div className="relative h-[50vh] md:h-[65vh] w-full overflow-hidden">
      {backdropUrl ? (
        <Image
          src={backdropUrl}
          alt={`Backdrop de ${movie.title}`}
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
