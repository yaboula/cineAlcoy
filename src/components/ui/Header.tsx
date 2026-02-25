"use client";

// ──────────────────────────────────────────────────
// Header — Sticky navbar with scroll-aware background,
// active-link highlighting, integrated SearchBar,
// and framer-motion animated entry
// ──────────────────────────────────────────────────

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Film, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Películas", href: "/movies" },
  { label: "Series", href: "/series" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isSearchPage = pathname.startsWith("/search");
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setSearchQuery("");
      searchRef.current?.blur();
    }
  }

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md shadow-lg shadow-black/30 border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-12 h-16 flex items-center gap-6">
        {/* ── Logo ──────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded-md"
          aria-label="Cinema — Inicio"
        >
          <Film
            className="w-6 h-6 text-accent-primary transition-transform duration-300 group-hover:scale-110"
            aria-hidden
          />
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Cinema
          </span>
        </Link>

        {/* ── Nav Links ─────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navegación principal">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                  isActive
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-md bg-surface-hover -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Spacer ────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Desktop SearchBar (hidden on /search) ─── */}
        {!isSearchPage && (
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center gap-2 bg-surface/70 border border-border rounded-lg px-3 py-1.5 w-56 lg:w-72 focus-within:border-accent-primary/60 focus-within:bg-surface transition-all duration-200"
          role="search"
        >
          <Search className="w-4 h-4 text-text-muted shrink-0" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar películas o series..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            aria-label="Buscar películas o series"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
        )}

        {/* ── Mobile: Search Icon (hidden on /search) ── */}
        {!isSearchPage && (
        <Link
          href="/search"
          className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          aria-label="Ir a búsqueda"
        >
          <Search className="w-5 h-5" />
        </Link>
        )}
      </div>
    </motion.header>
  );
}
