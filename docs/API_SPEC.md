# API Specifications & Data Models - Cinema App

## 1. TMDB API v3 — Endpoints Consumidos

> [!NOTE]
> Base URL: `https://api.themoviedb.org/3`
> Autenticación: Query param `api_key` o Header `Authorization: Bearer {access_token}`
> Todas las peticiones se realizan **exclusivamente desde el servidor** (Server Components / Server Actions).

---

### 1.1. Películas (Movies)

| Endpoint                            | Método | Descripción                                        | Caché               |
| ----------------------------------- | ------ | -------------------------------------------------- | ------------------- |
| `/movie/popular`                    | GET    | Lista de películas populares (paginada, 20/página) | `revalidate: 3600`  |
| `/movie/now_playing`                | GET    | Estrenos actuales en cartelera                     | `revalidate: 3600`  |
| `/movie/top_rated`                  | GET    | Películas mejor valoradas                          | `revalidate: 3600`  |
| `/movie/{movie_id}`                 | GET    | Detalle completo de una película                   | `revalidate: 3600`  |
| `/movie/{movie_id}/credits`         | GET    | Reparto y equipo técnico                           | `revalidate: 86400` |
| `/movie/{movie_id}/recommendations` | GET    | Películas recomendadas similares                   | `revalidate: 3600`  |

### 1.2. Series de TV (TV Shows)

| Endpoint                                 | Método | Descripción                                         | Caché              |
| ---------------------------------------- | ------ | --------------------------------------------------- | ------------------ |
| `/tv/popular`                            | GET    | Series populares (paginada, 20/página)              | `revalidate: 3600` |
| `/tv/on_the_air`                         | GET    | Series en emisión actualmente                       | `revalidate: 3600` |
| `/tv/top_rated`                          | GET    | Series mejor valoradas                              | `revalidate: 3600` |
| `/tv/{series_id}`                        | GET    | Detalle completo de una serie (incluye `seasons[]`) | `revalidate: 3600` |
| `/tv/{series_id}/season/{season_number}` | GET    | Lista de episodios de una temporada                 | `revalidate: 3600` |

### 1.3. Búsqueda y Géneros

| Endpoint                               | Método | Descripción                                        | Caché               |
| -------------------------------------- | ------ | -------------------------------------------------- | ------------------- |
| `/search/multi`                        | GET    | Búsqueda combinada (películas + series + personas) | `revalidate: 60`    |
| `/genre/movie/list`                    | GET    | Lista de géneros de películas                      | `revalidate: 86400` |
| `/genre/tv/list`                       | GET    | Lista de géneros de series                         | `revalidate: 86400` |
| `/trending/{media_type}/{time_window}` | GET    | Tendencias diarias/semanales                       | `revalidate: 3600`  |

### 1.4. Imágenes

> [!IMPORTANT]
> Base URL de imágenes: `https://image.tmdb.org/t/p/{size}/{path}`
> Tamaños comunes: `w92`, `w154`, `w185`, `w342`, `w500`, `w780`, `original`

---

## 2. VidSrc — Endpoints del Reproductor (Iframe)

> [!CAUTION]
> Estos endpoints se inyectan **únicamente como `src` del iframe**. Nunca se llaman desde el servidor ni se parsean.

| URL Pattern                                               | Tipo  | Descripción                           |
| --------------------------------------------------------- | ----- | ------------------------------------- |
| `https://vidsrc.to/embed/movie/{tmdb_id}`                 | Movie | Reproduce una película por su TMDB ID |
| `https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}` | TV    | Reproduce un episodio específico      |

---

## 3. Modelos de Dominio TypeScript

Estos son los contratos de datos que vivirán en `types/index.ts`. Representan la **forma mapeada** que usaremos internamente (no la respuesta cruda de TMDB).

### 3.1. Entidades Core

```typescript
// ──────────────────────────────────────────────
// Géneros
// ──────────────────────────────────────────────
export interface Genre {
  id: number;
  name: string;
}

// ──────────────────────────────────────────────
// Película (Resumen para Cards y Grids)
// ──────────────────────────────────────────────
export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "movie";
}

// ──────────────────────────────────────────────
// Película (Detalle completo)
// ──────────────────────────────────────────────
export interface MovieDetail {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  original_language: string;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ──────────────────────────────────────────────
// Serie de TV (Resumen para Cards y Grids)
// ──────────────────────────────────────────────
export interface TVShowSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type: "tv";
}

// ──────────────────────────────────────────────
// Serie de TV (Detalle completo)
// ──────────────────────────────────────────────
export interface TVShowDetail {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: SeasonSummary[];
  episode_run_time: number[];
  original_language: string;
  networks: Network[];
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ──────────────────────────────────────────────
// Temporada (Resumen dentro del detalle de serie)
// ──────────────────────────────────────────────
export interface SeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string | null;
}

// ──────────────────────────────────────────────
// Temporada (Detalle con lista de episodios)
// ──────────────────────────────────────────────
export interface SeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episodes: Episode[];
}

// ──────────────────────────────────────────────
// Episodio
// ──────────────────────────────────────────────
export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number | null;
}
```

### 3.2. Tipos de Respuesta API (Wrappers Paginados)

```typescript
// ──────────────────────────────────────────────
// Respuesta paginada genérica de TMDB
// ──────────────────────────────────────────────
export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Aliases tipados para mayor claridad
export type MovieListResponse = TMDBPaginatedResponse<MovieSummary>;
export type TVShowListResponse = TMDBPaginatedResponse<TVShowSummary>;
```

### 3.3. Tipos de Búsqueda Multi

```typescript
// ──────────────────────────────────────────────
// Resultado de /search/multi (unión discriminada)
// ──────────────────────────────────────────────
export interface PersonResult {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  media_type: "person";
}

export type MultiSearchResult = MovieSummary | TVShowSummary | PersonResult;
export type MultiSearchResponse = TMDBPaginatedResponse<MultiSearchResult>;
```

### 3.4. Tipos de Créditos (Cast & Crew)

```typescript
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface CreditsResponse {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}
```

### 3.5. Tipos del Cliente (Watch History)

```typescript
// ──────────────────────────────────────────────
// Historial de visualización (localStorage)
// ──────────────────────────────────────────────
export interface WatchHistoryItem {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  type: "movie" | "tv";
  timestamp: number; // UNIX epoch en ms
}

// Constantes
export const WATCH_HISTORY_KEY = "cinema_watch_history";
export const WATCH_HISTORY_MAX_ITEMS = 30;
```

---

## 4. Helpers de Imagen (Utilidad)

```typescript
// ──────────────────────────────────────────────
// Construir URL completa de imagen TMDB
// ──────────────────────────────────────────────
export type TMDBImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

export function getTMDBImageUrl(
  path: string | null,
  size: TMDBImageSize = "w500",
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
```
