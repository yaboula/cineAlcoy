// ──────────────────────────────────────────────────
// Cinema App — Input Validation
// ──────────────────────────────────────────────────

/**
 * Validates that a string is a valid positive integer TMDB ID.
 * @throws Error if the ID is invalid
 */
export function validateTMDBId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid TMDB ID: "${id}"`);
  }
  return parsed;
}

/**
 * Validates a season number (0 is valid for "Specials" in TMDB).
 * @throws Error if the season number is invalid
 */
export function validateSeasonNumber(season: string): number {
  const parsed = Number(season);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid season number: "${season}"`);
  }
  return parsed;
}

/**
 * Validates an episode number (must be a positive integer).
 * @throws Error if the episode number is invalid
 */
export function validateEpisodeNumber(episode: string): number {
  const parsed = Number(episode);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid episode number: "${episode}"`);
  }
  return parsed;
}
