"use client";

// 
// SearchBar  Two variants:
//    "compact"   header pill (small, navigates to /search)
//    "page"      full hero input (large, stays on /search)
// 

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, X, Film, Tv, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { getTMDBImageUrl } from "@/types";
import {
  fetchSearchSuggestions,
  type SearchSuggestion,
} from "@/app/actions/search-suggestions";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  /** "compact" = styled for the header; "page" = big hero input on /search */
  variant?: "compact" | "page";
}

export default function SearchBar({
  className,
  autoFocus = false,
  variant = "page",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [value, setValue] = useState(initialQ);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debounceNav = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debounceSug = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPage = variant === "page";

  // Sync value when URL changes (back/forward)  don't close while focused
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
    if (document.activeElement !== inputRef.current) {
      setShowDropdown(false);
    }
  }, [searchParams]);

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoading(true);
    try {
      const results = await fetchSearchSuggestions(q.trim());
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    clearTimeout(debounceNav.current);
    debounceNav.current = setTimeout(() => {
      if (q.trim()) {
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      } else {
        router.push("/search");
      }
    }, 400);

    clearTimeout(debounceSug.current);
    debounceSug.current = setTimeout(() => fetchSuggestions(q), 200);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (showDropdown) {
        setShowDropdown(false);
        e.stopPropagation();
        return;
      }
      setValue("");
      setSuggestions([]);
      if (!isPage) {
        router.push("/search");
        inputRef.current?.blur();
      }
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => (p > 0 ? p - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      navigateToItem(suggestions[selectedIndex]);
    } else if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  }

  function navigateToItem(item: SearchSuggestion) {
    setShowDropdown(false);
    router.push(item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`);
  }

  function handleClear() {
    setValue("");
    setSuggestions([]);
    setShowDropdown(false);
    clearTimeout(debounceNav.current);
    clearTimeout(debounceSug.current);
    router.push("/search");
    inputRef.current?.focus();
  }

  //  Variant styles 
  const wrapperClass = isPage
    ? cn(
        "flex items-center gap-3 bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl px-5 py-4",
        "focus-within:border-accent-primary/50 focus-within:bg-surface focus-within:shadow-xl focus-within:shadow-accent-primary/10",
        "transition-all duration-300",
        showDropdown && "rounded-b-none border-b-transparent"
      )
    : cn(
        "flex items-center gap-2 bg-surface/70 border border-border rounded-lg px-3 py-1.5",
        "focus-within:border-accent-primary/60 focus-within:bg-surface",
        "transition-all duration-200",
        showDropdown && "rounded-b-none border-b-transparent"
      );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className={wrapperClass} role="search">
        {isLoading ? (
          <Loader2
            className={cn(
              "shrink-0 animate-spin text-accent-primary",
              isPage ? "w-5 h-5" : "w-4 h-4"
            )}
            aria-hidden
          />
        ) : (
          <Search
            className={cn(
              "shrink-0 text-text-muted transition-colors",
              isPage ? "w-5 h-5" : "w-4 h-4"
            )}
            aria-hidden
          />
        )}

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={isPage ? "Busca una película, serie, actor..." : "Buscar..."}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none min-w-0",
            isPage ? "text-base lg:text-lg" : "text-sm"
          )}
          aria-label="Buscar películas o series"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              type="button"
              onClick={handleClear}
              className={cn(
                "shrink-0 rounded-full text-text-muted hover:text-text-primary transition-all",
                isPage ? "p-1 hover:bg-surface-hover" : ""
              )}
              aria-label="Limpiar"
            >
              <X className={isPage ? "w-4 h-4" : "w-3.5 h-3.5"} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/*  Suggestions dropdown  */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.ul
            key="dropdown"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className={cn(
              "absolute z-60 w-full bg-surface border border-border border-t-0 overflow-hidden shadow-2xl shadow-black/50",
              isPage ? "rounded-b-2xl" : "rounded-b-lg"
            )}
            role="listbox"
          >
            {suggestions.map((item, index) => {
              const posterUrl = getTMDBImageUrl(item.poster_path, "w92");
              const active = index === selectedIndex;
              return (
                <li key={`${item.type}-${item.id}`} role="option" aria-selected={active}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigateToItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 text-left transition-colors duration-100",
                      isPage ? "px-5 py-3" : "px-3 py-2",
                      active ? "bg-surface-hover" : "hover:bg-surface-hover"
                    )}
                  >
                    <div
                      className={cn(
                        "relative rounded overflow-hidden bg-surface-hover shrink-0",
                        isPage ? "w-9 h-14" : "w-7 h-10"
                      )}
                    >
                      {posterUrl ? (
                        <Image src={posterUrl} alt="" fill sizes="36px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-3 h-3 text-text-muted" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-text-primary truncate", isPage ? "text-sm" : "text-xs")}>
                        {item.title}
                      </p>
                      <p className={cn("text-text-muted mt-0.5", isPage ? "text-xs" : "text-[11px]")}>
                        {item.year && `${item.year} · `}
                        {item.type === "movie" ? "Película" : "Serie"}
                      </p>
                    </div>

                    {item.type === "movie" ? (
                      <Film className={cn("shrink-0 text-text-muted/60", isPage ? "w-4 h-4" : "w-3 h-3")} aria-hidden />
                    ) : (
                      <Tv className={cn("shrink-0 text-text-muted/60", isPage ? "w-4 h-4" : "w-3 h-3")} aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}

            {value.trim() && (
              <li className="border-t border-border/60">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setShowDropdown(false);
                    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 text-left font-medium text-accent-primary hover:bg-surface-hover transition-colors",
                    isPage ? "px-5 py-3 text-sm" : "px-3 py-2 text-xs"
                  )}
                >
                  <Search className={isPage ? "w-4 h-4" : "w-3 h-3"} aria-hidden />
                  Ver todos los resultados de &ldquo;{value.trim()}&rdquo;
                </button>
              </li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
