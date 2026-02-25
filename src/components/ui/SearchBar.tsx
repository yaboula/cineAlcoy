"use client";

// ──────────────────────────────────────────────────
// SearchBar — Debounced search input with live
// autocomplete dropdown powered by Server Action
// ──────────────────────────────────────────────────

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, X, Film, Tv } from "lucide-react";
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
}

export default function SearchBar({
  className,
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initialQ);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suggestionsRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync value when URL query changes (browser back/forward).
  // Do NOT close the dropdown while the input is focused — that would kill
  // suggestions the instant the debounce pushes the new URL.
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
    if (document.activeElement !== inputRef.current) {
      setShowDropdown(false);
    }
  }, [searchParams]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions via Server Action
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setIsLoadingSuggestions(true);
    try {
      const results = await fetchSearchSuggestions(query.trim());
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSelectedIndex(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    // Debounce navigation (longer delay)
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (q.trim()) {
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      } else {
        router.push("/search");
      }
    }, 500);

    // Debounce suggestions (shorter delay)
    clearTimeout(suggestionsRef.current);
    suggestionsRef.current = setTimeout(() => {
      fetchSuggestions(q);
    }, 250);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (showDropdown) {
        setShowDropdown(false);
      } else {
        setValue("");
        router.push("/search");
        inputRef.current?.blur();
      }
      return;
    }

    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = suggestions[selectedIndex];
      navigateToItem(selected);
    }
  }

  function navigateToItem(item: SearchSuggestion) {
    setShowDropdown(false);
    const href = item.type === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
    router.push(href);
  }

  function handleClear() {
    setValue("");
    setSuggestions([]);
    setShowDropdown(false);
    router.push("/search");
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* ── Input ─────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-3 bg-surface border border-border rounded-xl px-4 py-3 focus-within:border-accent-primary/60 focus-within:shadow-lg focus-within:shadow-accent-primary/10 transition-all duration-200",
          showDropdown && "rounded-b-none border-b-0"
        )}
        role="search"
      >
        <Search
          className={cn(
            "w-5 h-5 shrink-0 transition-colors",
            isLoadingSuggestions ? "text-accent-primary animate-pulse" : "text-text-muted"
          )}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Escribe el nombre de una película o serie..."
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted outline-none"
          aria-label="Buscar películas o series"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary rounded"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Suggestions Dropdown ──────────────────── */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full bg-surface border border-border border-t-0 rounded-b-xl overflow-hidden shadow-2xl shadow-black/40"
            role="listbox"
          >
            {suggestions.map((item, index) => {
              const posterUrl = getTMDBImageUrl(item.poster_path, "w92");
              const isSelected = index === selectedIndex;
              return (
                <li key={`${item.type}-${item.id}`} role="option" aria-selected={isSelected}>
                  <button
                    onClick={() => navigateToItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100",
                      isSelected
                        ? "bg-surface-hover"
                        : "hover:bg-surface-hover"
                    )}
                  >
                    {/* Mini poster */}
                    <div className="relative w-8 h-12 rounded overflow-hidden bg-surface-hover shrink-0">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-text-muted" />
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {item.year && `${item.year} · `}
                        {item.type === "movie" ? "Película" : "Serie"}
                      </p>
                    </div>

                    {/* Type icon */}
                    {item.type === "movie" ? (
                      <Film className="w-4 h-4 text-text-muted shrink-0" aria-hidden />
                    ) : (
                      <Tv className="w-4 h-4 text-text-muted shrink-0" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}

            {/* Search all results link */}
            <li>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  if (value.trim()) {
                    router.push(
                      `/search?q=${encodeURIComponent(value.trim())}`
                    );
                  }
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-accent-primary hover:bg-surface-hover transition-colors border-t border-border"
              >
                Ver todos los resultados para &ldquo;{value.trim()}&rdquo;
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
