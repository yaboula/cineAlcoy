# Sprint Roadmap — Cinema App

> Cada sprint produce un **entregable verificable**. Ningún sprint depende de código no escrito en un sprint anterior.
> El orden es estrictamente secuencial: no saltamos sprints. Cada tarea tiene un **criterio de aceptación** claro.

---

## Sprint 1 — Inicialización del Proyecto y Configuración Base

> **Objetivo:** Tener un proyecto Next.js corriendo en local con toda la configuración de herramientas lista y cero código de negocio.

### Tareas:

| #   | Tarea                                                                                                 | Archivo(s)                                                                                                                           | Criterio de Aceptación                                                                              |
| --- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 1.1 | Inicializar proyecto Next.js con App Router, TypeScript y Tailwind CSS                                | `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`                                                          | `npm run dev` arranca sin errores en `localhost:3000`                                               |
| 1.2 | Configurar TypeScript en modo estricto (`strict: true`)                                               | `tsconfig.json`                                                                                                                      | `"strict": true` presente. Compile sin errores                                                      |
| 1.3 | Crear archivo `.env.local` con las variables de TMDB y `.env.example` como referencia                 | `.env.local`, `.env.example`                                                                                                         | Variables `TMDB_API_KEY` y `TMDB_ACCESS_TOKEN` presentes. `.env.local` en `.gitignore`              |
| 1.4 | Configurar `.gitignore` completo                                                                      | `.gitignore`                                                                                                                         | Incluye `.env.local`, `node_modules`, `.next`                                                       |
| 1.5 | Configurar `next.config.ts` con Security Headers (CSP, X-Frame-Options) y dominio de imágenes TMDB    | `next.config.ts`                                                                                                                     | Headers de seguridad aplicados. `image.tmdb.org` en `images.remotePatterns`                         |
| 1.6 | Extender `tailwind.config.ts` con colores custom de Design System, fuente Inter, y animación `fadeIn` | `tailwind.config.ts`                                                                                                                 | Colores `background`, `surface`, `accent-primary` accesibles como clases. `animate-fadeIn` definido |
| 1.7 | Crear estructura de carpetas vacía según ADR                                                          | Directorios: `components/ui/`, `components/catalog/`, `components/player/`, `components/providers/`, `lib/tmdb/`, `types/`, `hooks/` | Todas las carpetas existen con archivos `.gitkeep` o `index.ts` vacío                               |

### Verificación Sprint 1:

- [ ] `npm run dev` → Se ve la página default de Next.js
- [ ] `npm run build` → Build exitoso sin errores ni warnings de TypeScript
- [ ] Inspeccionar headers en DevTools → CSP y X-Frame-Options presentes

---

## Sprint 2 — Sistema de Tipos y Capa de Datos TMDB

> **Objetivo:** Todas las interfaces TypeScript definidas y la capa de servicio (fetchers) conectada a TMDB, probada y funcionando.

### Tareas:

| #   | Tarea                                            | Archivo(s)            | Criterio de Aceptación                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | Definir todas las interfaces de dominio          | `types/index.ts`      | Interfaces: `Genre`, `MovieSummary`, `MovieDetail`, `TVShowSummary`, `TVShowDetail`, `SeasonSummary`, `SeasonDetail`, `Episode`, `ProductionCompany`, `Network`, `CastMember`, `CrewMember`, `CreditsResponse`, `PersonResult`, `WatchHistoryItem`. Tipos: `TMDBPaginatedResponse<T>`, `MovieListResponse`, `TVShowListResponse`, `MultiSearchResult`, `MultiSearchResponse`. Constantes: `WATCH_HISTORY_KEY`, `WATCH_HISTORY_MAX_ITEMS`. Helper: `getTMDBImageUrl()`, tipo `TMDBImageSize` |
| 2.2 | Crear fetcher base con manejo de errores y caché | `lib/tmdb/fetcher.ts` | Función `tmdbFetch<T>(endpoint, options?)` que construye URL con API key, aplica `revalidate`, y lanza error tipado en caso de fallo HTTP                                                                                                                                                                                                                                                                                                                                                   |
| 2.3 | Crear funciones de películas                     | `lib/tmdb/movies.ts`  | Funciones exportadas: `getPopularMovies(page?)`, `getNowPlayingMovies(page?)`, `getTopRatedMovies(page?)`, `getMovieDetail(id)`, `getMovieCredits(id)`, `getMovieRecommendations(id)`                                                                                                                                                                                                                                                                                                       |
| 2.4 | Crear funciones de series de TV                  | `lib/tmdb/tv.ts`      | Funciones exportadas: `getPopularTVShows(page?)`, `getOnTheAirTVShows(page?)`, `getTopRatedTVShows(page?)`, `getTVShowDetail(id)`, `getSeasonDetail(seriesId, seasonNumber)`                                                                                                                                                                                                                                                                                                                |
| 2.5 | Crear funciones de búsqueda y trending           | `lib/tmdb/search.ts`  | Funciones: `searchMulti(query, page?)`, `getTrending(mediaType, timeWindow)`                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2.6 | Crear funciones de géneros                       | `lib/tmdb/genres.ts`  | Funciones: `getMovieGenres()`, `getTVGenres()`                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2.7 | Crear utilidades de validación de inputs         | `lib/validation.ts`   | Funciones: `validateTMDBId(id)`, `validateSeasonNumber(season)`, `validateEpisodeNumber(episode)`. Lanza `Error` para valores inválidos                                                                                                                                                                                                                                                                                                                                                     |
| 2.8 | Crear utilidad de imágenes y classnames          | `lib/utils.ts`        | Re-exporta `getTMDBImageUrl` de types. Función `cn()` para merge de classNames (usando `clsx` + `tailwind-merge`)                                                                                                                                                                                                                                                                                                                                                                           |

### Verificación Sprint 2:

- [ ] Crear un archivo temporal `app/test/page.tsx` que llame a `getPopularMovies()` y renderice los títulos como un `<ul>` → Se ven 20 títulos de películas
- [ ] Llamar a `getMovieDetail(550)` (Fight Club) → Se ve título, sinopsis, géneros
- [ ] Llamar a `getTVShowDetail(1396)` (Breaking Bad) → Se ve nombre y número de temporadas
- [ ] Llamar a `getSeasonDetail(1396, 1)` → Se ve la lista de episodios de la temporada 1
- [ ] Llamar a `searchMulti('batman')` → Se ven resultados mixtos
- [ ] Llamar a `validateTMDBId('abc')` → Lanza Error
- [ ] Eliminar página `app/test/` después de verificar

---

## Sprint 3 — Componentes UI Base (Design System)

> **Objetivo:** Todos los componentes atómicos reutilizables construidos y estilizados según el Design System, sin lógica de negocio.

### Tareas:

| #    | Tarea                                         | Archivo(s)                             | Criterio de Aceptación                                                                                                                                                                         |
| ---- | --------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | Crear componente `CardSkeleton`               | `components/ui/CardSkeleton.tsx`       | Props: ninguna. Renderiza el skeleton de una card con `animate-pulse`, `aspect-[2/3]`, colores del Design System                                                                               |
| 3.2  | Crear componente `HeroSkeleton`               | `components/ui/HeroSkeleton.tsx`       | Renderiza un bloque `h-[60vh]` con `animate-pulse bg-[#141420]`                                                                                                                                |
| 3.3  | Crear componente `DetailSkeleton`             | `components/ui/DetailSkeleton.tsx`     | Renderiza: backdrop skeleton + poster lateral + 5 líneas de texto skeleton de anchos variados                                                                                                  |
| 3.4  | Crear componente `EpisodeRowSkeleton`         | `components/ui/EpisodeRowSkeleton.tsx` | Renderiza 5 filas `h-16` con `animate-pulse`                                                                                                                                                   |
| 3.5  | Crear componente `ImageWithFallback` (Client) | `components/ui/ImageWithFallback.tsx`  | `'use client'`. Props: `src`, `alt`, `fallbackTitle`, `className`, `fill`, `sizes`. Muestra `<Image>` de Next.js. En `onError` o si `src` es null → muestra placeholder con ícono SVG + título |
| 3.6  | Crear componente `RatingBadge`                | `components/ui/RatingBadge.tsx`        | Props: `score: number`. Muestra ★ + score formateado a 1 decimal. Color `text-amber-400`                                                                                                       |
| 3.7  | Crear componente `GenreBadge`                 | `components/ui/GenreBadge.tsx`         | Props: `name: string`. Badge `text-xs` con bordes redondeados y fondo sutil                                                                                                                    |
| 3.8  | Crear componente `EmptyState`                 | `components/ui/EmptyState.tsx`         | Props: `icon?: ReactNode`, `title: string`, `description: string`, `actionLabel?: string`, `actionHref?: string`. Layout centrado con ícono SVG, textos, y CTA opcional                        |
| 3.9  | Crear componente `ErrorFallback` (Client)     | `components/ui/ErrorFallback.tsx`      | `'use client'`. Props: `message: string`, `onRetry: () => void`, `showHomeLink?: boolean`. Botones "Intentar de nuevo" y "Ir al inicio"                                                        |
| 3.10 | Crear componente `LoadMoreButton` (Client)    | `components/ui/LoadMoreButton.tsx`     | `'use client'`. Props: `onClick`, `isLoading`, `hasMore`. Muestra botón o spinner. Disabled durante carga. Oculto si `!hasMore`                                                                |
| 3.11 | Crear componente `PlayerDisclaimer`           | `components/ui/PlayerDisclaimer.tsx`   | Dos líneas de texto estático: disclaimer de sandbox (amber) y disclaimer general (gray). Clases `text-xs`                                                                                      |

### Verificación Sprint 3:

- [ ] Crear una página temporal `/test-ui` que renderice todos los componentes en una cuadrícula → Todos los componentes se ven correctamente, colores coinciden con Design System
- [ ] `ImageWithFallback` con `src={null}` → Muestra placeholder
- [ ] `ImageWithFallback` con URL rota → Muestra placeholder
- [ ] `LoadMoreButton` con `isLoading={true}` → Muestra spinner, click deshabilitado
- [ ] `ErrorFallback` → Ambos botones son funcionales
- [ ] Eliminar página de test después

---

## Sprint 4 — Layout Principal (Header, Footer, RootLayout)

> **Objetivo:** La estructura visual global de la app está lista. Cualquier página que coloquemos dentro se verá enmarcada con Header y Footer.

### Tareas:

| #   | Tarea                                                                         | Archivo(s)                 | Criterio de Aceptación                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.1 | Configurar Root Layout con fuente Inter, metadata base, y fondo oscuro global | `app/layout.tsx`           | `<html lang="es">`, fuente Inter cargada, `className="bg-[#0a0a0f] text-[#e5e5e5]"`                                                                                                                                |
| 4.2 | Crear componente Header/Navbar (Client)                                       | `components/ui/Header.tsx` | `'use client'`. Logo "Cinema" → link a `/`. NavLinks: "Películas", "Series". Ícono de búsqueda (mobile) / SearchBar inline (desktop). Scroll: transparente → `backdrop-blur` al desplazarse. Active link resaltado |
| 4.3 | Crear componente Footer                                                       | `components/ui/Footer.tsx` | Disclaimer legal. Links a TMDB. Copyright "© 2026 Cinema". Responsive: vertical → horizontal                                                                                                                       |
| 4.4 | Crear Route Group Layout `(main)`                                             | `app/(main)/layout.tsx`    | Renderiza `<Header />`, `{children}`, `<Footer />`                                                                                                                                                                 |
| 4.5 | Crear `error.tsx` global (dentro de `(main)`)                                 | `app/(main)/error.tsx`     | Usa `ErrorFallback` con mensaje "No pudimos cargar el catálogo"                                                                                                                                                    |
| 4.6 | Crear `loading.tsx` global (dentro de `(main)`)                               | `app/(main)/loading.tsx`   | Renderiza `HeroSkeleton` + 3 filas de 6 `CardSkeleton`                                                                                                                                                             |
| 4.7 | Crear `not-found.tsx` global                                                  | `app/not-found.tsx`        | SVG cinematográfico + "404 — Escena no encontrada" + botón "Volver al inicio"                                                                                                                                      |

### Verificación Sprint 4:

- [ ] `npm run dev` → Header visible con logo, links de navegación, ícono de búsqueda
- [ ] Scroll la página → Header cambia de transparente a blur
- [ ] Resize a mobile → NavLinks se adaptan, solo ícono de lupa visible
- [ ] Navegar a una URL inexistente (ej. `/xyz`) → Se ve la página 404 custom
- [ ] Footer visible en la parte inferior con disclaimer y links

---

## Sprint 5 — MediaCard y MediaRow (Componentes de Catálogo)

> **Objetivo:** Los bloques que pintarán el catálogo de películas/series. Listos para recibir datos de TMDB.

### Tareas:

| #   | Tarea                                        | Archivo(s)                               | Criterio de Aceptación                                                                                                                                                                                                                                           |
| --- | -------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1 | Crear componente `MediaCard`                 | `components/catalog/MediaCard.tsx`       | Props: `id`, `title`, `posterPath`, `voteAverage`, `mediaType`, `releaseDate`. Renderiza: `ImageWithFallback` (poster) + título truncado + año + `RatingBadge`. Link a `/movie/[id]` o `/tv/[id]`. Hover: `scale-105 shadow-xl`. Focus: `ring-2 ring-indigo-500` |
| 5.2 | Crear componente `MediaRow`                  | `components/catalog/MediaRow.tsx`        | Props: `title: string`, `items: (MovieSummary \| TVShowSummary)[]`. Renderiza: H2 título de sección + grid responsive (`grid-cols-2 sm:3 md:4 lg:5 xl:6`) de `MediaCard`                                                                                         |
| 5.3 | Crear componente `CardSkeletonRow`           | `components/catalog/CardSkeletonRow.tsx` | Renderiza: un div con título skeleton + grid de 6 `CardSkeleton`. Usado como fallback de `<Suspense>`                                                                                                                                                            |
| 5.4 | Crear componente `MediaGrid` (para búsqueda) | `components/catalog/MediaGrid.tsx`       | Props: `items: (MovieSummary \| TVShowSummary)[]`. Grid responsive sin título de sección. Reutiliza `MediaCard`                                                                                                                                                  |

### Verificación Sprint 5:

- [ ] Página temporal con `MediaRow` hardcodeado con datos mock → Se ven 6 cards en grid responsive
- [ ] `MediaCard` con `posterPath={null}` → Muestra placeholder
- [ ] Hover sobre card → Animación de zoom y sombra
- [ ] Click en card → Navega a `/movie/[id]` (o `/tv/[id]`)
- [ ] Mobile → 2 columnas. Tablet → 3-4. Desktop → 5-6

---

## Sprint 6 — Homepage (Página Principal)

> **Objetivo:** La página de inicio muestra datos reales de TMDB con secciones de Tendencias, Estrenos y Mejor Valoradas.

### Tareas:

| #   | Tarea                                                         | Archivo(s)                                 | Criterio de Aceptación                                                                                                                                                                    |
| --- | ------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | Crear componente `HeroBanner` (Server)                        | `components/catalog/HeroBanner.tsx`        | Recibe la película/serie #1 del trending. Renderiza: backdrop `<Image fill priority>` + gradient overlay + título H1 + sinopsis truncada (3 líneas) + botón "Ver ahora" (link al detalle) |
| 6.2 | Crear sección asíncrona `TrendingSection` (Server)            | `components/catalog/TrendingSection.tsx`   | Llama a `getTrending('all', 'week')`. Renderiza `<MediaRow title="Tendencias" items={...} />`                                                                                             |
| 6.3 | Crear sección asíncrona `NowPlayingSection` (Server)          | `components/catalog/NowPlayingSection.tsx` | Llama a `getNowPlayingMovies()`. Renderiza `<MediaRow title="Estrenos" items={...} />`                                                                                                    |
| 6.4 | Crear sección asíncrona `TopRatedSection` (Server)            | `components/catalog/TopRatedSection.tsx`   | Llama a `getTopRatedMovies()`. Renderiza `<MediaRow title="Mejor Valoradas" items={...} />`                                                                                               |
| 6.5 | Crear sección asíncrona `PopularTVSection` (Server)           | `components/catalog/PopularTVSection.tsx`  | Llama a `getPopularTVShows()`. Renderiza `<MediaRow title="Series Populares" items={...} />`                                                                                              |
| 6.6 | Ensamblar Homepage con `<Suspense>` independiente por sección | `app/(main)/page.tsx`                      | Cada sección envuelta en `<Suspense fallback={<CardSkeletonRow />}>`. Si una sección falla, las demás siguen cargando (aislamiento de errores)                                            |
| 6.7 | Crear `loading.tsx` de Homepage                               | `app/(main)/loading.tsx`                   | Ya existe del Sprint 4 — verificar que coincide                                                                                                                                           |
| 6.8 | Crear `generateMetadata` para Homepage                        | `app/(main)/page.tsx`                      | Título: "Cinema — Descubre y reproduce películas y series", descripción SEO                                                                                                               |

### Verificación Sprint 6:

- [ ] `npm run dev` → Homepage muestra Hero banner con película real de TMDB
- [ ] Se ven 4 secciones: Tendencias, Estrenos, Mejor Valoradas, Series Populares
- [ ] Cada sección tiene al menos 20 cards con pósters, títulos y ratings reales
- [ ] Hacer `ctrl+shift+J` → No hay errores en consola
- [ ] Inspeccionar `<title>` → Título SEO correcto
- [ ] Simular TMDB caído (cambiar API key) → `error.tsx` con botón reintentar
- [ ] Hacer refresh de la página → Carga instantánea (datos cacheados 1hr)

---

## Sprint 7 — Página de Detalle: Película (`/movie/[id]`)

> **Objetivo:** Navegar a una película y ver toda su información (sin reproductor aún).

### Tareas:

| #   | Tarea                                                               | Archivo(s)                                   | Criterio de Aceptación                                                                                                                                 |
| --- | ------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7.1 | Crear `page.tsx` con validación de ID y fetch de detalle + créditos | `app/(main)/movie/[id]/page.tsx`             | Llama a `validateTMDBId`, `getMovieDetail`, `getMovieCredits`, `getMovieRecommendations`. Si ID inválido → `notFound()`. Si 404 de TMDB → `notFound()` |
| 7.2 | Crear componente `MovieHero` (Server)                               | `components/catalog/MovieHero.tsx`           | Backdrop con `<Image fill priority>` + gradient overlay bottom + título overlay                                                                        |
| 7.3 | Crear componente `MovieInfo` (Server)                               | `components/catalog/MovieInfo.tsx`           | Poster lateral + título H1 + tagline + año + duración + `GenreBadge[]` + `RatingBadge` + sinopsis completa                                             |
| 7.4 | Crear componente `CastCarousel` (Server)                            | `components/catalog/CastCarousel.tsx`        | Scroll horizontal de miembros del cast con foto circular (`ImageWithFallback` round) + nombre + personaje                                              |
| 7.5 | Crear sección `RecommendationsGrid` (Server)                        | `components/catalog/RecommendationsGrid.tsx` | Renderiza `<MediaRow title="También te puede gustar" items={...} />` con recomendaciones                                                               |
| 7.6 | Crear `loading.tsx` de detalle                                      | `app/(main)/movie/[id]/loading.tsx`          | Renderiza `DetailSkeleton`                                                                                                                             |
| 7.7 | Crear `error.tsx` de detalle                                        | `app/(main)/movie/[id]/error.tsx`            | Usa `ErrorFallback` con mensaje "No pudimos cargar esta película"                                                                                      |
| 7.8 | Crear `not-found.tsx` de detalle                                    | `app/(main)/movie/[id]/not-found.tsx`        | "Esta película no existe" + botón "Volver al inicio"                                                                                                   |
| 7.9 | Implementar `generateMetadata` dinámico                             | `app/(main)/movie/[id]/page.tsx`             | Título: `{movie.title} — Cinema`. Descripción: sinopsis truncada. Open Graph image: backdrop                                                           |

### Verificación Sprint 7:

- [ ] Navegar a `/movie/550` → Se ve "Fight Club" con backdrop, poster, sinopsis, cast
- [ ] Cast muestra al menos los primeros 10 actores con fotos
- [ ] Recomendaciones se ven debajo con cards clickeables
- [ ] Navegar a `/movie/999999999` → Se ve la página not-found
- [ ] Navegar a `/movie/abc` → Se ve la página not-found
- [ ] `<title>` → "Fight Club — Cinema"
- [ ] Resize a mobile → Layout pasa de horizontal (poster+info) a vertical (stack)
- [ ] Loading → Skeleton visible durante 0.5-1s aproximadamente

---

## Sprint 8 — Reproductor de Video (VidSrc Iframe)

> **Objetivo:** El reproductor funciona en la página de película. Se ve el video dentro de un iframe con entorno oscuro inmersivo.

### Tareas:

| #   | Tarea                                                 | Archivo(s)                                | Criterio de Aceptación                                                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8.1 | Crear componente `VideoPlayer` (Client)               | `components/player/VideoPlayer.tsx`       | `'use client'`. Props: `tmdbId: number`, `type: 'movie' \| 'tv'`, `season?: number`, `episode?: number`. Construye URL de VidSrc. Renderiza iframe `aspect-video` dentro de div `bg-black`. Atributo `sandbox` según SECURITY.md (probar Nivel 1 primero). State: `isLoading` (muestra spinner mientras iframe carga → `onLoad` lo oculta) |
| 8.2 | Crear componente `PlayerDisclaimer`                   | `components/player/PlayerDisclaimer.tsx`  | Dos disclaimers: sandbox warning (amber) + general (gray)                                                                                                                                                                                                                                                                                  |
| 8.3 | Integrar `VideoPlayer` en la página de película       | `app/(main)/movie/[id]/page.tsx`          | Añadir `VideoPlayer` entre `MovieInfo` y `RecommendationsGrid`. Envuelto en sección `bg-black py-8`                                                                                                                                                                                                                                        |
| 8.4 | Crear componente `WatchHistorySaver` (Client)         | `components/player/WatchHistorySaver.tsx` | `'use client'`. Props: `tmdbId`, `title`, `posterPath`, `type`. En `useEffect` al montar → guarda en `localStorage` via `useWatchHistory` hook. Componente invisible (retorna `null`)                                                                                                                                                      |
| 8.5 | Integrar `WatchHistorySaver` en la página de película | `app/(main)/movie/[id]/page.tsx`          | Añadir `<WatchHistorySaver>` con los datos de la película actual                                                                                                                                                                                                                                                                           |
| 8.6 | Probar niveles de sandbox del iframe                  | Manual                                    | Si Nivel 1 funciona → mantener. Si no → pasar a Nivel 2 y asegurar que `PlayerDisclaimer` muestra warning                                                                                                                                                                                                                                  |

### Verificación Sprint 8:

- [ ] Navegar a `/movie/550` → Se ve el reproductor de video dentro de un fondo negro
- [ ] El iframe carga el video correctamente (si VidSrc está disponible)
- [ ] Spinner visible mientras el iframe carga, desaparece después
- [ ] Disclaimer visible debajo del reproductor
- [ ] Entorno alrededor del reproductor es completamente negro (theater mode)
- [ ] DevTools → localStorage → Hay entrada de Fight Club en el historial
- [ ] Aspect ratio 16:9 se mantiene en todas las resoluciones

---

## Sprint 9 — Hook useWatchHistory y Sección "Continuar Viendo"

> **Objetivo:** El historial de visualización funciona completamente. La sección "Continuar Viendo" aparece en la Homepage si hay datos.

### Tareas:

| #   | Tarea                                            | Archivo(s)                                   | Criterio de Aceptación                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9.1 | Crear hook `useWatchHistory`                     | `hooks/useWatchHistory.ts`                   | Funciones: `getHistory(): WatchHistoryItem[]`, `addToHistory(item)`, `removeFromHistory(tmdbId)`, `clearHistory()`. Validación de schema al leer. Límite de 30 items (FIFO). `try/catch` para localStorage inaccesible. Patrón `isMounted` para evitar errores de hidratación |
| 9.2 | Crear componente `ContinueWatchingRow` (Client)  | `components/catalog/ContinueWatchingRow.tsx` | `'use client'`. Usa `useWatchHistory()`. Si historial vacío → retorna `null` (sección oculta). Si hay datos → renderiza fila horizontal scrollable de cards. Cada card: poster, título, badge "Película"/"Serie"                                                              |
| 9.3 | Integrar `ContinueWatchingRow` en Homepage       | `app/(main)/page.tsx`                        | Añadir como primera sección después del Hero (antes de Tendencias)                                                                                                                                                                                                            |
| 9.4 | Actualizar `WatchHistorySaver` para usar el hook | `components/player/WatchHistorySaver.tsx`    | Usa `addToHistory()` del hook                                                                                                                                                                                                                                                 |

### Verificación Sprint 9:

- [ ] Visitar `/movie/550` → Volver a Homepage → Sección "Continuar Viendo" aparece con Fight Club
- [ ] Visitar 3 películas diferentes → Las 3 aparecen en "Continuar Viendo", la más reciente primero
- [ ] Primera visita (sin historial) → Sección "Continuar Viendo" no aparece
- [ ] DevTools → Application → Local Storage → Borrar `cinema_watch_history` → Refresh → Sección desaparece
- [ ] Simular más de 30 entradas en localStorage → Solo se mantienen 30

---

## Sprint 10 — Página de Detalle: Serie de TV (`/tv/[id]`)

> **Objetivo:** La página de detalle de series funciona con selector de temporada y lista de episodios.

### Tareas:

| #     | Tarea                                                             | Archivo(s)                                                     | Criterio de Aceptación                                                                                                                                                                             |
| ----- | ----------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10.1  | Crear `page.tsx` con validación de ID y fetch de detalle de serie | `app/(main)/tv/[id]/page.tsx`                                  | Llama a `validateTMDBId`, `getTVShowDetail`. Si ID inválido → `notFound()`                                                                                                                         |
| 10.2  | Crear componente `TVShowInfo` (Server)                            | `components/catalog/TVShowInfo.tsx`                            | Similar a MovieInfo pero con: `number_of_seasons`, `number_of_episodes`, `networks[]`, estado (en emisión, finalizada)                                                                             |
| 10.3  | Crear componente `SeasonSelector` (Client)                        | `components/player/SeasonSelector.tsx`                         | `'use client'`. Props: `seriesId`, `seasons: SeasonSummary[]`. Dropdown `<select>` estilizado. Al cambiar → hace fetch a `getSeasonDetail` via Server Action y actualiza lista de episodios        |
| 10.4  | Crear componente `EpisodeList` (Client)                           | `components/player/EpisodeList.tsx`                            | `'use client'`. Props: `episodes: Episode[]`, `currentEpisode`, `onEpisodeSelect`. Renderiza lista de `EpisodeCard`. Episodio activo resaltado                                                     |
| 10.5  | Crear componente `EpisodeCard` (Client)                           | `components/player/EpisodeCard.tsx`                            | `'use client'`. Props: `episode: Episode`, `isActive`, `onClick`. Muestra: número, título, still image (con fallback), duración, sinopsis truncada. Click → invoca `onEpisodeSelect`               |
| 10.6  | Crear componente `TVPlayerSection` (Client)                       | `components/player/TVPlayerSection.tsx`                        | `'use client'`. Ensambla: `VideoPlayer` + `SeasonSelector` + `EpisodeList`. Gestiona estado de `currentSeason` y `currentEpisode`. Al seleccionar episodio → cambia `src` del iframe dinámicamente |
| 10.7  | Crear Server Action para obtener episodios                        | `app/actions/tmdb.ts`                                          | `'use server'` función `fetchSeasonEpisodes(seriesId, seasonNumber)` que llama a `getSeasonDetail` y retorna episodios                                                                             |
| 10.8  | Integrar `TVPlayerSection` y `WatchHistorySaver` en página de TV  | `app/(main)/tv/[id]/page.tsx`                                  | VideoPlayer + Selector de temporada/episodios + Guardado en historial                                                                                                                              |
| 10.9  | Crear `loading.tsx`, `error.tsx`, `not-found.tsx` para TV         | `app/(main)/tv/[id]/loading.tsx`, `error.tsx`, `not-found.tsx` | Misma estructura que en `/movie/[id]` pero adaptada a series                                                                                                                                       |
| 10.10 | Implementar `generateMetadata` dinámico para TV                   | `app/(main)/tv/[id]/page.tsx`                                  | Título: `{show.name} — Cinema`                                                                                                                                                                     |

### Verificación Sprint 10:

- [ ] Navegar a `/tv/1396` → Se ve "Breaking Bad" con info completa
- [ ] Selector de temporada muestra 5 temporadas + Specials
- [ ] Seleccionar Temporada 2 → Lista de episodios se actualiza
- [ ] Click en Episodio 3 → Iframe cambia a S2E3, episodio 3 queda resaltado
- [ ] Info muestra: estado "Ended", 5 temporadas, 62 episodios, network AMC
- [ ] Resize mobile → Layout stack vertical funciona
- [ ] Navegar a `/tv/99999999` → Página not-found
- [ ] `<title>` → "Breaking Bad — Cinema"

---

## Sprint 11 — Página de Búsqueda (`/search`)

> **Objetivo:** Búsqueda funcional con debounce, resultados paginados, estados vacíos y de error.

### Tareas:

| #    | Tarea                                   | Archivo(s)                                    | Criterio de Aceptación                                                                                                                                                                                                                 |
| ---- | --------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11.1 | Crear componente `SearchBar` (Client)   | `components/ui/SearchBar.tsx`                 | `'use client'`. Input controlado con efecto de debounce (300ms). Al escribir → `router.push(/search?q=...)` via `useRouter` + `useSearchParams`. Placeholder: "Escribe el nombre de una película o serie...". `Escape` → limpia input  |
| 11.2 | Crear `page.tsx` de búsqueda            | `app/(main)/search/page.tsx`                  | Lee `searchParams.q`. Si vacío → muestra estado Initial ("Escribe el nombre..."). Si hay query → llama a `searchMulti(query)`. Filtra resultados: solo `movie` y `tv` (excluye `person`). Muestra `SearchResultCount` + `MediaGrid`    |
| 11.3 | Crear componente `SearchResultCount`    | `components/catalog/SearchResultCount.tsx`    | Props: `count: number`, `query: string`. Badge: "42 resultados para 'batman'"                                                                                                                                                          |
| 11.4 | Implementar paginación con "Cargar más" | `app/(main)/search/page.tsx` + Client wrapper | El Server Component renderiza la primera página. Un Client wrapper maneja el estado de paginación, usa Server Action para obtener más páginas, y agrega resultados al grid. Botón "Cargar más" desaparece cuando `page >= total_pages` |
| 11.5 | Crear `EmptySearchState`                | `components/catalog/EmptySearchState.tsx`     | SVG de lupa + "No encontramos resultados para '{query}'" + "Prueba con otro término"                                                                                                                                                   |
| 11.6 | Crear `loading.tsx` de búsqueda         | `app/(main)/search/loading.tsx`               | SearchBar + Grid de `CardSkeleton`                                                                                                                                                                                                     |
| 11.7 | Crear `error.tsx` de búsqueda           | `app/(main)/search/error.tsx`                 | `ErrorFallback` con "La búsqueda no pudo completarse"                                                                                                                                                                                  |
| 11.8 | Integrar `SearchBar` en Header          | `components/ui/Header.tsx`                    | Desktop: input inline en navbar. Mobile: ícono que navega a `/search`                                                                                                                                                                  |
| 11.9 | Implementar `generateMetadata` dinámico | `app/(main)/search/page.tsx`                  | Título: "Buscar '{query}' — Cinema" o "Búsqueda — Cinema" si no hay query                                                                                                                                                              |

### Verificación Sprint 11:

- [ ] Navegar a `/search` → Se ve SearchBar + estado initial
- [ ] Escribir "batman" → Resultados aparecen después del debounce
- [ ] Se muestran solo películas y series (no personas)
- [ ] Badge muestra "N resultados para 'batman'"
- [ ] Click en "Cargar más" → Se añaden más resultados. Botón disabled durante carga
- [ ] Cargar hasta que no haya más páginas → Botón desaparece
- [ ] Buscar "xyzqweasd123" → Empty State con ícono de lupa
- [ ] Borrar texto → Vuelve a estado initial
- [ ] Desde Desktop Header: escribir en SearchBar inline → Navega a `/search?q=...`
- [ ] Desde Mobile Header: click ícono lupa → Navega a `/search`

---

## Sprint 12 — Navegación entre Películas y Series en Header

> **Objetivo:** Los links "Películas" y "Series" del Header funcionan, llevando a páginas dedicadas con listas filtradas.

### Tareas:

| #    | Tarea                                            | Archivo(s)                                                       | Criterio de Aceptación                                                                                                                |
| ---- | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 12.1 | Crear páginas de categoría `/movies` y `/series` | `app/(main)/movies/page.tsx`, `app/(main)/series/page.tsx`       | Cada una muestra grid completo de su tipo respectivo (Popular + Top Rated + Now Playing / On The Air). Usa secciones con `<Suspense>` |
| 12.2 | Crear `loading.tsx` para ambas categorías        | `app/(main)/movies/loading.tsx`, `app/(main)/series/loading.tsx` | Grids de `CardSkeleton`                                                                                                               |
| 12.3 | Crear `error.tsx` para ambas categorías          | `app/(main)/movies/error.tsx`, `app/(main)/series/error.tsx`     | `ErrorFallback`                                                                                                                       |
| 12.4 | Actualizar NavLinks en Header                    | `components/ui/Header.tsx`                                       | "Películas" → `/movies`, "Series" → `/series`. Link activo resaltado según `usePathname()`                                            |
| 12.5 | Implementar `generateMetadata`                   | Ambos `page.tsx`                                                 | "Películas — Cinema", "Series — Cinema"                                                                                               |

### Verificación Sprint 12:

- [ ] Click en "Películas" → Se ven secciones de películas populares, estrenos, mejor valoradas
- [ ] Click en "Series" → Se ven secciones de series populares, en emisión, mejor valoradas
- [ ] Link activo en navbar resaltado en blanco, los demás en gris
- [ ] Ambas páginas tienen loading skeletons y error boundaries

---

## Sprint 13 — Pulido Visual y Animaciones

> **Objetivo:** La app se siente premium. Transiciones suaves, animaciones cuidadas, detalles visuales perfectos.

### Tareas:

| #    | Tarea                                                     | Archivo(s)                          | Criterio de Aceptación                                                                    |
| ---- | --------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 13.1 | Implementar animación `fadeIn` en transiciones de página  | CSS/Tailwind + componentes          | Las secciones aparecen con fade suave al cargar (`animate-fadeIn`)                        |
| 13.2 | Refinar hover effects en `MediaCard`                      | `components/catalog/MediaCard.tsx`  | Hover: zoom suave + sombra indigo + badge de tipo ("Película"/"Serie") fade-in            |
| 13.3 | Añadir scroll suave (smooth scroll behavior)              | `app/layout.tsx`                    | `scroll-smooth` en `<html>`                                                               |
| 13.4 | Refinar gradientes del Hero Banner                        | `components/catalog/HeroBanner.tsx` | Gradiente bottom-to-top suave, sin cortes bruscos. Texto legible sobre cualquier backdrop |
| 13.5 | Refinar Episode Card hover y active states                | `components/player/EpisodeCard.tsx` | Hover: fondo sutil. Active: borde indigo izquierdo + background indigo alpha              |
| 13.6 | Añadir transición al Header en scroll                     | `components/ui/Header.tsx`          | Transición suave `transition-all duration-300` de transparente a blur                     |
| 13.7 | Verificar contraste de color (WCAG AA)                    | Todos los componentes de texto      | Todo texto principal cumple ratio 4.5:1 contra su fondo                                   |
| 13.8 | Verificar focus rings en todos los elementos interactivos | Todos los botones, links, cards     | Todos muestran `focus-visible:ring-2 ring-indigo-500` al navegar con Tab                  |

### Verificación Sprint 13:

- [ ] Navegar por toda la app con `Tab` → Todos los elementos tienen focus ring visible
- [ ] Transiciones entre páginas: fade suave sin parpadeos
- [ ] Hero tiene gradiente impecable, texto siempre legible
- [ ] Cards zoom suave y sin jank
- [ ] Header scroll transition smooth
- [ ] Lighthouse Accessibility score >= 90

---

## Sprint 14 — SEO, Performance y Metadata Final

> **Objetivo:** La app está optimizada para motores de búsqueda y rendimiento verificado con herramientas.

### Tareas:

| #    | Tarea                                                             | Archivo(s)                      | Criterio de Aceptación                                                    |
| ---- | ----------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| 14.1 | Verificar todas las páginas tienen `generateMetadata` correcto    | Todos los `page.tsx`            | Cada página tiene `<title>` y `<meta description>` únicos                 |
| 14.2 | Añadir Open Graph metadata                                        | Todos los `page.tsx` de detalle | `og:title`, `og:description`, `og:image` (backdrop de TMDB)               |
| 14.3 | Crear `robots.txt`                                                | `app/robots.ts`                 | Permite crawling de todas las páginas públicas                            |
| 14.4 | Crear `sitemap.xml` dinámico (opcional)                           | `app/sitemap.ts`                | Genera sitemap con las páginas estáticas (Homepage, Búsqueda, Categorías) |
| 14.5 | Verificar `<Image>` con `sizes` correcto en todos los componentes | Poster images, backdrop images  | `sizes` reflejan el ancho real por breakpoint para optimización           |
| 14.6 | Verificar caché headers de TMDB                                   | DevTools Network                | Requests repetidas al mismo endpoint usan HIT de caché                    |
| 14.7 | Lazy load del iframe verificado                                   | DevTools Network                | El iframe solo carga cuando el usuario scroll hasta él                    |

### Verificación Sprint 14:

- [ ] Lighthouse Performance score >= 85
- [ ] Lighthouse SEO score >= 95
- [ ] View page source de `/movie/550` → `<title>` y `<meta>` correctos en el HTML
- [ ] Network tab → Requests a TMDB reducidas por caché (solo 1 request por endpoint por hora)
- [ ] Compartir URL en redes sociales → Preview card muestra título, descripción e imagen

---

## Sprint 15 — Testing Unitario

> **Objetivo:** Los módulos críticos tienen tests unitarios que validan su lógica.

### Tareas:

| #    | Tarea                                    | Archivo(s)                          | Criterio de Aceptación                                                                                                    |
| ---- | ---------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 15.1 | Instalar y configurar Vitest             | `vitest.config.ts`, `package.json`  | `npm run test` ejecuta Vitest correctamente                                                                               |
| 15.2 | Tests para `lib/validation.ts`           | `__tests__/validation.test.ts`      | Tests para: IDs válidos, IDs inválidos (negativos, 0, float, string), season 0 (especiales), episode inválido             |
| 15.3 | Tests para `getTMDBImageUrl`             | `__tests__/utils.test.ts`           | Tests para: path válido, path null, diferentes tamaños                                                                    |
| 15.4 | Tests para `useWatchHistory`             | `__tests__/useWatchHistory.test.ts` | Tests para: add item, get history, remove item, max limit (30), datos corruptos en localStorage, localStorage inaccesible |
| 15.5 | Tests para `lib/tmdb/fetcher.ts` con MSW | `__tests__/tmdb-fetcher.test.ts`    | Tests con mock server: response exitosa, error 404, error 500, timeout                                                    |

### Verificación Sprint 15:

- [ ] `npm run test` → Todas las suites pasan (verde)
- [ ] Coverage: `lib/validation.ts` 100%, `hooks/useWatchHistory.ts` >= 90%

---

## Sprint 16 — Testing E2E (Playwright)

> **Objetivo:** Los flujos críticos de usuario están cubiertos con tests end-to-end automatizados.

### Tareas:

| #    | Tarea                            | Archivo(s)                             | Criterio de Aceptación                                                       |
| ---- | -------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 16.1 | Instalar y configurar Playwright | `playwright.config.ts`, `package.json` | `npx playwright test` ejecuta sin errores de config                          |
| 16.2 | E2E-01: Homepage Load            | `e2e/homepage.spec.ts`                 | Verifica que la Homepage carga con al menos 1 sección de películas           |
| 16.3 | E2E-02: Navigate to Movie Detail | `e2e/movie-detail.spec.ts`             | Click en primera card → URL cambia a `/movie/[id]` → título visible          |
| 16.4 | E2E-03: Player Renders           | `e2e/movie-detail.spec.ts`             | En detalle de película → iframe de VidSrc presente con `src` correcto        |
| 16.5 | E2E-04: Search Flow              | `e2e/search.spec.ts`                   | Escribir en SearchBar → resultados aparecen → click lleva a detalle          |
| 16.6 | E2E-05: Watch History            | `e2e/watch-history.spec.ts`            | Visitar película → volver a Home → sección "Continuar Viendo" muestra título |
| 16.7 | E2E-06: TV Season Selector       | `e2e/tv-detail.spec.ts`                | En detalle de serie → cambiar temporada → episodios se actualizan            |
| 16.8 | E2E-07: Error State              | `e2e/error-states.spec.ts`             | Navegar a `/movie/abc` → página not-found con botón funcional                |
| 16.9 | E2E-08: Empty Search             | `e2e/search.spec.ts`                   | Buscar término sin resultados → empty state visible                          |

### Verificación Sprint 16:

- [ ] `npx playwright test` → Todos los tests pasan
- [ ] Generar reporte HTML: `npx playwright show-report` → Todos verdes

---

## Sprint 17 — Build de Producción y Auditoría Final

> **Objetivo:** La aplicación compila para producción sin errores, pasa todas las auditorías de calidad, y está lista para deploy.

### Tareas:

| #    | Tarea                                                                | Archivo(s)                 | Criterio de Aceptación                                                                      |
| ---- | -------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| 17.1 | Ejecutar `npm run build` — verificar cero errores TypeScript         | Build output               | Build exitoso. 0 errores TS. 0 warnings                                                     |
| 17.2 | Ejecutar `npm run lint` — verificar cero errores de ESLint           | Lint output                | 0 errores. 0 warnings (o solo warnings menores justificados)                                |
| 17.3 | Ejecutar Lighthouse audit completo en producción local (`npm start`) | —                          | Performance >= 85, Accessibility >= 90, Best Practices >= 90, SEO >= 95                     |
| 17.4 | Verificar Checklist de Seguridad (SECURITY.md §7)                    | Manual                     | Todos los items del checklist marcados                                                      |
| 17.5 | Verificar que API Key NO está en el bundle del cliente               | DevTools → Sources/Network | Buscar en el JS del cliente: no hay rastros de la API Key                                   |
| 17.6 | Verificar responsive en 3 resoluciones clave                         | DevTools Device Mode       | iPhone SE (375px), iPad (768px), Desktop (1440px). Todos los layouts correctos              |
| 17.7 | Stress test de navegación                                            | Manual                     | Navegar rápidamente por 10+ páginas → Sin memory leaks, sin errores de consola, sin crashes |
| 17.8 | Revisar consola en DevTools                                          | Manual                     | 0 errores, 0 warnings no justificados en console                                            |

### Verificación Sprint 17:

- [ ] `npm run build` → ✅ éxito
- [ ] `npm run lint` → ✅ éxito
- [ ] Lighthouse → Todos los scores en verde
- [ ] Seguridad → Checklist completo
- [ ] API Key → No visible al cliente
- [ ] App estable bajo navegación intensiva

---

## Resumen de Sprints

| Sprint | Nombre                      | Dependencia | Archivos Nuevos (aprox.) |
| ------ | --------------------------- | ----------- | ------------------------ |
| **1**  | Inicialización y Config     | —           | 7                        |
| **2**  | Tipos y Capa de Datos TMDB  | S1          | 8                        |
| **3**  | Componentes UI Base         | S1          | 11                       |
| **4**  | Layout Principal            | S1, S3      | 7                        |
| **5**  | MediaCard y MediaRow        | S3          | 4                        |
| **6**  | Homepage                    | S2, S4, S5  | 6                        |
| **7**  | Detalle Película            | S2, S3      | 9                        |
| **8**  | Reproductor VidSrc          | S7          | 5                        |
| **9**  | Watch History               | S8          | 3                        |
| **10** | Detalle Serie TV            | S2, S8      | 10                       |
| **11** | Búsqueda                    | S2, S5      | 7                        |
| **12** | Categorías Películas/Series | S2, S5      | 6                        |
| **13** | Pulido Visual               | S6-S12      | 0 (refactor)             |
| **14** | SEO y Performance           | S6-S12      | 3                        |
| **15** | Testing Unitario            | S2, S9      | 5                        |
| **16** | Testing E2E                 | S6-S12      | 8                        |
| **17** | Build y Auditoría Final     | Todo        | 0 (verificación)         |

**Total: 17 Sprints · ~99 tareas atómicas · ~92 archivos nuevos**
