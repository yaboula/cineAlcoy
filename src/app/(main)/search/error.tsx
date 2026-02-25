"use client";
import ErrorFallback from "@/components/ui/ErrorFallback";
interface E { error: Error & { digest?: string }; reset: () => void; }
export default function SearchError({ reset }: E) {
  return <ErrorFallback message="La búsqueda no pudo completarse. Inténtalo de nuevo." onRetry={reset} />;
}
