"use client";

// ──────────────────────────────────────────────────
// Header — Sticky navbar with scroll-aware background,
// active-link highlighting, integrated SearchBar,
// framer-motion animated entry, and mobile nav drawer
// ──────────────────────────────────────────────────

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, Search, Menu, X, User, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProfileContext } from "@/components/providers/ProfileProvider";
import SearchBar from "@/components/ui/SearchBar";

const NAV_LINKS = [
  { label: "Películas", href: "/movies" },
  { label: "Series", href: "/series" },
  { label: "Mi lista", href: "/watchlist" },
];

export default function Header() {
  const pathname = usePathname();
  const isSearchPage = pathname.startsWith("/search");
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfileContext();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = !authLoading && !!user;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
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

          {/* ── Nav Links (desktop) ─────────────────── */}
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

          {/* ── Auth area (desktop) ───────────────── */}
          {isLoggedIn ? (
            <Link
              href="/profile"
              className={cn(
                "hidden md:flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                pathname === "/profile"
                  ? "border-accent-primary bg-accent-primary/15 text-accent-primary"
                  : "border-border text-text-secondary hover:border-accent-primary/50 hover:text-text-primary"
              )}
              aria-label="Mi perfil"
              title={profile?.display_name ?? "Perfil"}
            >
              {profile?.avatar_emoji ? (
                <span className="text-sm leading-none">{profile.avatar_emoji}</span>
              ) : (
                <User className="w-4 h-4" aria-hidden />
              )}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden />
              Entrar
            </Link>
          )}

          {/* ── Mobile menu toggle ──────────────────── */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <X className="w-5 h-5" aria-hidden />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="block"
                >
                  <Menu className="w-5 h-5" aria-hidden />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.header>

      {/* ── Mobile Navigation Drawer ────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden
            />

            {/* Slide-in panel */}
            <motion.nav
              key="mobile-nav"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-background/95 backdrop-blur-xl border-l border-border/50 shadow-2xl md:hidden flex flex-col"
              aria-label="Navegación móvil"
            >
              {/* Close area — top */}
              <div className="h-16 flex items-center justify-end px-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" aria-hidden />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 px-4 py-4 space-y-1">
                {NAV_LINKS.map(({ label, href }, index) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <motion.div
                      key={href}
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.2 }}
                    >
                      <Link
                        href={href}
                        className={cn(
                          "block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                          isActive
                            ? "text-text-primary bg-surface-hover border-l-2 border-accent-primary"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                        )}
                      >
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Search link in mobile menu */}
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 + NAV_LINKS.length * 0.05, duration: 0.2 }}
                >
                  <Link
                    href="/search"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                      isSearchPage
                        ? "text-text-primary bg-surface-hover border-l-2 border-accent-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                    )}
                  >
                    <Search className="w-4 h-4" aria-hidden />
                    Buscar
                  </Link>
                </motion.div>

                {/* Profile / Login link in mobile menu */}
                <motion.div
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 + (NAV_LINKS.length + 1) * 0.05, duration: 0.2 }}
                >
                  {isLoggedIn ? (
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                        pathname === "/profile"
                          ? "text-text-primary bg-surface-hover border-l-2 border-accent-primary"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                      )}
                    >
                      {profile?.avatar_emoji ? (
                        <span className="text-base leading-none">{profile.avatar_emoji}</span>
                      ) : (
                        <User className="w-4 h-4" aria-hidden />
                      )}
                      Mi perfil
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-accent-primary hover:bg-surface-hover transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    >
                      <LogIn className="w-4 h-4" aria-hidden />
                      Iniciar sesión
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Footer branding */}
              <div className="px-4 py-6 border-t border-border/50">
                <div className="flex items-center gap-2 text-text-muted">
                  <Film className="w-4 h-4 text-accent-primary" aria-hidden />
                  <span className="text-xs font-medium">Cinema</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
