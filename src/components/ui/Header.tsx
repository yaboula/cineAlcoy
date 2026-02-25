"use client";

// ──────────────────────────────────────────────────
// Header — Sticky navbar with scroll-aware background,
// active-link highlighting, integrated SearchBar,
// and framer-motion animated entry
// ──────────────────────────────────────────────────

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/ui/SearchBar";
import { Search } from "lucide-react";

const NAV_LINKS = [
  { label: "Películas", href: "/movies" },
  { label: "Series", href: "/series" },
];

export default function Header() {
  const pathname = usePathname();
  const isSearchPage = pathname.startsWith("/search");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

        {/* ── Compact SearchBar (hidden on /search — the page has its own) ── */}
        {!isSearchPage && (
          <>
            <Suspense fallback={null}>
              <SearchBar variant="compact" className="hidden md:block w-48 lg:w-64" />
            </Suspense>
            <Link
              href="/search"
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
              aria-label="Ir a búsqueda"
            >
              <motion.span whileTap={{ scale: 0.9 }} className="block">
                <Search className="w-5 h-5" aria-hidden />
              </motion.span>
            </Link>
          </>
        )}
      </div>
    </motion.header>
  );
}
