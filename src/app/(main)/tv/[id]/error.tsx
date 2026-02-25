"use client";
import ErrorFallback from "@/components/ui/ErrorFallback";
interface ErrorProps { error: Error & { digest?: string }; reset: () => void; }
export default function TVError({ reset }: ErrorProps) {
  return <ErrorFallback message="No pudimos cargar esta serie. Puede ser un problema temporal." onRetry={reset} />;
}
