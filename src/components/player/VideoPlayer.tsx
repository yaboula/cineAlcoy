"use client";

// ──────────────────────────────────────────────────
// VideoPlayer — Multi-source iframe player
// Default: vidsrc.to
//
// vidsrc.to embed URLs:
//   Movie:   https://vidsrc.to/embed/movie/{tmdb_id}
//   Episode: https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}
//
// Security:
//   - click-to-play: iframe only mounts after user interaction
//   - window.open blocker: patches parent window to suppress ad popups
//   - referrerPolicy="no-referrer": hides domain from embed sources
// ──────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { MonitorPlay, ChevronDown, Play } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import PlayerDisclaimer from "@/components/ui/PlayerDisclaimer";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import { fetchAkwamStreamUrl } from "@/actions/akwam-action";
/** Format seconds as "1h 23m" or "12:34" */
function formatResumeTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Sources ──────────────────────────────────────
interface PlayerSource {
  id: string;
  label: string;
  /**
   * "iframe" — renders the URL inside a sandboxed <iframe> (default).
   * "direct" — fetches a direct .mp4 URL and renders a <video> element.
   */
  sourceType?: "iframe" | "direct";
  /** Required for iframe sources; omitted for direct sources. */
  buildUrl?: (tmdbId: number, type: "movie" | "tv", season: number, episode: number) => string;
}

const SOURCES: PlayerSource[] = [
  {
    id: "vidsrc-to",
    label: "VidSrc",
    buildUrl: (id, type, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "2embed",
    label: "2Embed",
    buildUrl: (id, type, s, e) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "superembed",
    label: "SuperEmbed",
    buildUrl: (id, type, s, e) => {
      const base = `https://multiembed.mov/?video_id=${id}&tmdb=1`;
      return type === "movie" ? base : `${base}&s=${s}&e=${e}`;
    },
  },
  {
    id: "smashy",
    label: "SmashyStream",
    buildUrl: (id, type, s, e) =>
      type === "movie"
        ? `https://player.smashy.stream/movie/${id}`
        : `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}`,
  },
  {
    id: "akwam",
    label: "Akwam عربي",
    sourceType: "direct",
    // No buildUrl — stream URL is resolved server-side via fetchAkwamStreamUrl
  },
];

const STORAGE_KEY = "cinema_player_source";

// ── Props ────────────────────────────────────────
interface VideoPlayerProps {
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  backdropUrl?: string | null;
  posterPath?: string | null;
  title?: string;
  genreIds?: number[];
  releaseYear?: number | null;
  durationSeconds?: number;
  // TV only — forwarded to useWatchProgress
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
}

// ── Component ────────────────────────────────────
export default function VideoPlayer({ tmdbId, type, season, episode, backdropUrl, posterPath, title, genreIds, releaseYear, durationSeconds, seasonNumber, episodeNumber, episodeTitle }: VideoPlayerProps) {
  const s = season ?? 1;
  const e = episode ?? 1;

  // ── Watch progress (elapsed-time based for iframe players) ──
  const { resumeFrom, saveProgress } = useWatchProgress({
    tmdbId,
    mediaType: type,
    title:           title ?? "",
    posterPath:      posterPath,
    backdropPath:    backdropUrl,
    genreIds:        genreIds ?? [],
    releaseYear:     releaseYear,
    durationSeconds: durationSeconds ?? 0,
    seasonNumber:    seasonNumber,
    episodeNumber:   episodeNumber,
    episodeTitle:    episodeTitle,
  });

  const elapsedRef  = useRef(0);
  const timerRef    = useRef<ReturnType<typeof setInterval>>(undefined);
  const hasSavedRef = useRef(false);

  // When resumeFrom loads, initialise the elapsed counter so progress
  // continues from where the user left off instead of starting at 0.
  useEffect(() => {
    if (resumeFrom > 0) {
      elapsedRef.current = resumeFrom;
    }
  }, [resumeFrom]);

  // Start as false so the iframe is always visible in Brave
  // (Brave may suppress cross-origin onLoad events)
  const [isLoading, setIsLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  // Track which iframeKey the user has started — auto-resets on content/source change
  const [startedKey, setStartedKey] = useState<string | null>(null);
  // Always initialise to the default — reads localStorage after mount to avoid
  // SSR/client mismatch (React hydration error #418).
  const [sourceId, setSourceId] = useState<string>("vidsrc-to");

  // Restore last chosen source from localStorage after hydration.
  // "akwam" is never persisted (scraper-based, session-only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== "akwam" && SOURCES.some((src) => src.id === saved)) setSourceId(saved);
    } catch { /* ignore */ }
  }, []);

  const active = SOURCES.find((src) => src.id === sourceId) ?? SOURCES[0];
  const iframeKey = `${sourceId}-${tmdbId}-${s}-${e}`;
  const iframeSrc =
    active.sourceType === "direct"
      ? ""
      : (active.buildUrl?.(tmdbId, type, s, e) ?? "");
  const hasStarted = startedKey === iframeKey;

  // ── Akwam direct-mp4 state ──────────────────────
  const [akwamUrl, setAkwamUrl] = useState<string | null>(null);
  const [akwamError, setAkwamError] = useState<string | null>(null);
  const [akwamLoading, setAkwamLoading] = useState(false);

  // Reset elapsed/saved refs when the content changes (e.g. new episode)
  const prevKeyRef = useRef(iframeKey);
  useEffect(() => {
    if (prevKeyRef.current !== iframeKey) {
      prevKeyRef.current = iframeKey;
      elapsedRef.current = resumeFrom > 0 ? resumeFrom : 0;
      hasSavedRef.current = false;
      // Reset akwam state when movie or source changes
      setAkwamUrl(null);
      setAkwamError(null);
      setAkwamLoading(false);
    }
  }, [iframeKey, resumeFrom]);

  // Fetch the direct .mp4 URL from Akwam when the user presses play
  useEffect(() => {
    if (sourceId !== "akwam" || !hasStarted || akwamUrl !== null || akwamError !== null) {
      return;
    }
    let cancelled = false;
    setAkwamLoading(true);
    fetchAkwamStreamUrl(tmdbId)
      .then(({ url, error }) => {
        if (cancelled) return;
        setAkwamUrl(url);
        setAkwamError(error);
      })
      .catch(() => {
        if (!cancelled) setAkwamError("Error inesperado al contactar con Akwam");
      })
      .finally(() => {
        if (!cancelled) setAkwamLoading(false);
      });
    return () => { cancelled = true; };
  }, [sourceId, hasStarted, tmdbId, akwamUrl, akwamError]);

  // Start elapsed timer once the user presses play, save every 30 s
  useEffect(() => {
    if (!hasStarted) return;
    timerRef.current = setInterval(() => {
      elapsedRef.current += 30;
      const pct = durationSeconds ? elapsedRef.current / durationSeconds : 0;
      saveProgress(elapsedRef.current, pct >= 0.9);
    }, 30_000);

    return () => {
      clearInterval(timerRef.current);
      // Save on unmount if we watched at least 30 s
      if (elapsedRef.current >= 30 && !hasSavedRef.current) {
        hasSavedRef.current = true;
        saveProgress(elapsedRef.current, false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, iframeKey]);

  // Auto-hide spinner after 3s — fallback for browsers that suppress onLoad
  useEffect(() => {
    if (isLoading) {
      loadTimerRef.current = setTimeout(() => setIsLoading(false), 3000);
    }
    return () => clearTimeout(loadTimerRef.current);
  }, [isLoading, iframeKey]);

  // Block popup windows opened by the embed player (ads)
  useEffect(() => {
    const original = window.open.bind(window);
    window.open = () => null;
    return () => { window.open = original; };
  }, []);

  function selectSource(id: string) {
    setSourceId(id);
    setIsLoading(false); // Don't show spinner on source change — just swap
    setOpen(false);
    // Don't persist akwam — it's scraper-based and session-only
    if (id !== "akwam") {
      try { localStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
    }
  }

  return (
    <div className="bg-black">
      <div className="mx-auto max-w-5xl px-0 md:px-4 lg:px-0">

        {/* ── Toolbar ─────────────────────────────── */}
        <div className="flex items-center justify-between px-4 md:px-0 pb-3">
          <div className="flex items-center gap-1.5">
            <MonitorPlay className="w-3.5 h-3.5 text-accent-primary" aria-hidden />
            <span className="text-xs text-text-muted">Reproductor</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface/80 border border-border text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent-primary/40 transition-all"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              {active.label}
              <ChevronDown
                className={cn("w-3 h-3 transition-transform duration-150", open && "rotate-180")}
              />
            </button>

            {open && (
              <ul
                role="listbox"
                className="absolute right-0 top-full mt-1 min-w-35 bg-surface border border-border rounded-lg overflow-hidden shadow-xl shadow-black/40 z-20"
              >
                {SOURCES.map((src) => (
                  <li key={src.id} role="option" aria-selected={src.id === sourceId}>
                    <button
                      onClick={() => selectSource(src.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs transition-colors",
                        src.id === sourceId
                          ? "bg-accent-primary/20 text-accent-primary font-medium"
                          : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                      )}
                    >
                      {src.label}
                      {src.id === "vidsrc-to" && (
                        <span className="ml-1.5 text-[10px] text-accent-primary/70">★ default</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ── Player frame ────────────────────────── */}
        <div className="relative aspect-video rounded-none md:rounded-lg overflow-hidden bg-black">

          {/* Click-to-play gate — iframe only mounts after user interaction */}
          {!hasStarted ? (
            <button
              onClick={() => setStartedKey(iframeKey)}
              className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary overflow-hidden"
              aria-label="Reproducir"
            >
              {/* Backdrop thumbnail */}
              {backdropUrl && (
                <>
                  <Image
                    src={backdropUrl!}
                    alt=""
                    aria-hidden={true}
                    fill
                    sizes="100vw"
                    className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300 scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-black/20" />
                </>
              )}
              {!backdropUrl && <div className="absolute inset-0 bg-black/90" />}
              {/* Play button */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center transition-all duration-200 group-hover:bg-white/20 group-hover:border-white/60 group-hover:scale-110 shadow-2xl">
                  <Play className="w-8 h-8 text-white fill-white ml-1" aria-hidden />
                </div>
                {title && (
                  <p className="text-white/80 text-sm font-medium">{title}</p>
                )}
                {resumeFrom > 30 ? (
                  <p className="text-accent-primary text-xs font-medium">
                    Continuar desde {formatResumeTime(resumeFrom)}
                  </p>
                ) : (
                  <p className="text-white/50 text-xs">Pulsa para reproducir</p>
                )}
              </div>
            </button>
          ) : active.sourceType === "direct" ? (
            // ── Native video player for direct .mp4 sources (e.g. Akwam) ─────
            <>
              {akwamLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-10 h-10 animate-spin text-accent-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" d="M12 3a9 9 0 109 9" />
                    </svg>
                    <p className="text-xs text-text-muted">Buscando en Akwam…</p>
                  </div>
                </div>
              )}
              {!akwamLoading && akwamError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <p className="text-sm text-red-400 text-center px-6">{akwamError}</p>
                </div>
              )}
              {!akwamLoading && akwamUrl && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  key={akwamUrl}
                  src={akwamUrl}
                  controls
                  autoPlay
                  className="w-full h-full bg-black"
                  aria-label={`Reproductor nativo — ${title ?? "película"}`}
                />
              )}
            </>
          ) : (
            // ── Iframe player for all other sources ───────────────────────────
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="w-10 h-10 animate-spin text-accent-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" d="M12 3a9 9 0 109 9" />
                    </svg>
                    <p className="text-xs text-text-muted">Cargando {active.label}...</p>
                  </div>
                </div>
              )}

              <iframe
                  key={iframeKey}
                  src={iframeSrc}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  title={`Reproductor ${active.label}`}
                  onLoad={() => { clearTimeout(loadTimerRef.current); setIsLoading(false); }}
                />
            </>
          )}
        </div>

        <p className="text-[11px] text-text-muted text-center mt-2 px-4 md:px-0">
          Si el contenido no está disponible en VidSrc, prueba con otro servidor arriba.
        </p>
      </div>

      <PlayerDisclaimer />
    </div>
  );
}