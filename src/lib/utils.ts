import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export { getTMDBImageUrl } from "@/types";

/**
 * Merge Tailwind CSS classes safely.
 * Uses clsx for conditional logic + tailwind-merge to resolve conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a vote average to 1 decimal (e.g. 8.123 → "8.1").
 */
export function formatRating(score: number): string {
  return score.toFixed(1);
}

/**
 * Format runtime in minutes to "Xh Ym" (e.g. 148 → "2h 28m").
 */
export function formatRuntime(minutes: number | null): string {
  if (!minutes || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Truncate text to a maximum length, appending "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + "...";
}
