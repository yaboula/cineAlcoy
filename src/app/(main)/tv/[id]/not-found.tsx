import Link from "next/link";
import { Film } from "lucide-react";
export default function TVNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 text-center animate-fadeIn">
      <Film className="w-20 h-20 text-surface-hover" strokeWidth={0.8} aria-hidden />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-text-primary">Esta serie no existe</h1>
        <p className="text-text-secondary text-sm max-w-sm">El ID de la serie es inválido o no está disponible en TMDB.</p>
      </div>
      <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-medium hover:bg-accent-hover transition-all active:scale-95">
        Volver al inicio
      </Link>
    </div>
  );
}
