"use client";
import ErrorFallback from "@/components/ui/ErrorFallback";
interface E { error: Error & { digest?: string }; reset: () => void; }
export default function MoviesError({ reset }: E) {
  return <ErrorFallback message="No pudimos cargar las películas." onRetry={reset} />;
}
