// ──────────────────────────────────────────────────
// CastCarousel — Horizontal scroll of cast members
// Server Component
// ──────────────────────────────────────────────────

import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { getTMDBImageUrl } from "@/lib/utils";
import type { CastMember } from "@/types";

interface CastCarouselProps {
  cast: CastMember[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  if (cast.length === 0) return null;

  const displayCast = cast.slice(0, 15);

  return (
    <section aria-label="Reparto">
      <h2 className="text-xl font-bold text-text-primary mb-4">Reparto</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {displayCast.map((member) => {
          const photoUrl = getTMDBImageUrl(member.profile_path, "w185");
          return (
            <div key={member.id} className="shrink-0 w-20 text-center">
              {/* Circle photo */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-hover mx-auto mb-2 ring-2 ring-border">
                <ImageWithFallback
                  src={photoUrl}
                  alt={member.name}
                  fill
                  sizes="80px"
                  className="object-top"
                />
              </div>
              <p className="text-xs font-medium text-text-primary leading-snug line-clamp-2">
                {member.name}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">
                {member.character}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
