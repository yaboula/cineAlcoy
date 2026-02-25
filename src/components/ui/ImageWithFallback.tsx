"use client";

// ──────────────────────────────────────────────────
// ImageWithFallback — Next.js Image with error/null fallback
// ──────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  fallbackTitle?: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackTitle,
  className,
  fill = false,
  sizes,
  width,
  height,
  priority = false,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 bg-surface-hover",
          className
        )}
      >
        <Film className="w-10 h-10 text-text-muted" aria-hidden />
        {fallbackTitle && (
          <span className="text-xs text-text-secondary text-center px-2 line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setHasError(true)}
    />
  );
}
