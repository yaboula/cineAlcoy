"use client";

// ──────────────────────────────────────────────────────────────────────────────
// NativeVideoPlayer  —  HTML5 video player backed by Consumet / FlixHQ
//
// Fetches a direct stream URL (m3u8 or mp4) from /api/stream, then plays it
// with HLS.js (for .m3u8) or a plain <video> src (for .mp4).
// ──────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

/** Minimal type-only import to avoid SSR issues */
type HlsType = import("hls.js").default;

interface NativeVideoPlayerProps {
  tmdbId: number;
  type: "movie" | "tv";
  title: string;
  releaseYear?: number | null;
  season?: number;
  episode?: number;
  resumeFrom?: number;
  durationSeconds?: number;
  onProgress?: (elapsed: number, completed: boolean) => void;
}

interface StreamData {
  url: string;
  isM3U8: boolean;
  quality: string;
  subtitles: { url: string; lang: string }[];
}

export default function NativeVideoPlayer({
  tmdbId,
  type,
  title,
  releaseYear,
  season = 1,
  episode = 1,
  resumeFrom = 0,
  durationSeconds = 0,
  onProgress,
}: NativeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<HlsType | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // ── Fetch stream URL from our API proxy ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setStreamData(null);
    setElapsed(0);

    // Elapsed timer — shows user the request is in-flight (Railway can be slow to wake)
    const tick = setInterval(() => setElapsed((n) => n + 1), 1000);

    const params = new URLSearchParams({
      title,
      type,
      ...(releaseYear ? { year: String(releaseYear) } : {}),
      ...(type === "tv" ? { season: String(season), episode: String(episode) } : {}),
    });

    fetch(`/api/stream?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Stream unavailable");
        return json as StreamData;
      })
      .then((data) => {
        if (!cancelled) {
          clearInterval(tick);
          setStreamData(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          clearInterval(tick);
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; clearInterval(tick); };
  // reset whenever the target content changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, type, season, episode, retryCount]);

  // ── Attach HLS.js (or native) once we have a stream URL ───────────────────
  useEffect(() => {
    if (!streamData || !videoRef.current) return;
    const video = videoRef.current;

    // Destroy any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (streamData.isM3U8) {
      // Dynamic import keeps hls.js out of the SSR bundle
      import("hls.js").then(({ default: Hls }) => {
        if (!Hls.isSupported()) {
          // Safari has native HLS support — use it directly
          video.src = streamData.url;
          video.load();
          seekAndPlay(video);
          return;
        }
        const hls = new Hls({ enableWorker: false });
        hlsRef.current = hls;
        hls.loadSource(streamData.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          seekAndPlay(video);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) setError("HLS error — try another source");
        });
      });
    } else {
      // Plain mp4 / direct link
      video.src = streamData.url;
      video.load();
      seekAndPlay(video);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamData]);

  // ── Seek helper ────────────────────────────────────────────────────────────
  const seekAndPlay = (video: HTMLVideoElement) => {
    const doPlay = () => {
      if (resumeFrom > 0) video.currentTime = resumeFrom;
      video.play().catch(() => { /* autoplay blocked — user will click play */ });
    };
    if (video.readyState >= 1) {
      doPlay();
    } else {
      video.addEventListener("loadedmetadata", doPlay, { once: true });
    }
  };

  // ── Progress reporting ─────────────────────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;
    const elapsed = Math.floor(video.currentTime);
    const pct = durationSeconds > 0 ? elapsed / durationSeconds : 0;
    // Report every 30 s of playback to avoid hammering the DB
    if (elapsed > 0 && elapsed % 30 < 2) {
      onProgress(elapsed, pct >= 0.9);
    }
  }, [onProgress, durationSeconds]);

  // ── Error subtitles ────────────────────────────────────────────────────────
  const subtitleTracks = streamData?.subtitles ?? [];

  return (
    <div className="relative w-full h-full bg-black">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-accent-primary" />
          <p className="text-sm text-text-muted">
            {elapsed < 8 ? "Buscando stream directo…" : "Despertando servidor…"}
          </p>
          <p className="text-xs text-text-muted/60">
            {elapsed < 8
              ? "Resolviendo con FlixHQ · puede tardar unos segundos"
              : `Servidor tardando en responder · ${elapsed}s · por favor espera`}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 px-6 text-center">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
          <p className="text-sm font-medium text-text-primary">
            No se pudo obtener un stream directo
          </p>
          <p className="text-xs text-text-muted max-w-xs">{error}</p>
          <button
            onClick={() => setRetryCount((n) => n + 1)}
            className="flex items-center gap-2 mt-1 px-4 py-2 rounded-lg bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
          <p className="text-xs text-text-muted/60 max-w-xs">
            Si persiste, prueba otro reproductor del menú de fuentes
          </p>
        </div>
      )}

      {/* Native video element — always in DOM so ref works */}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        onTimeUpdate={handleTimeUpdate}
        style={{ display: loading || error ? "none" : "block" }}
        crossOrigin="anonymous"
      >
        {/* Subtitle tracks once available */}
        {subtitleTracks.map((sub) => (
          <track
            key={sub.lang}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.lang}
          />
        ))}
      </video>
    </div>
  );
}
