# Architecture Decision Records (ADR) - Cinema App

## 1. Top-Level Next.js Architecture (App Router)

El proyecto utiliza estrictamente el paradigma **React Server Components (RSC)** como centro de todas las operaciones de obtención de datos para optimizar la velocidad y la seguridad.

### Decisiones Clave:

- **Default = Server Component:** Todos los archivos en `app/` serán componentes de servidor por defecto.
- **Uso de `'use client'` restringido:** Solo se aplicará a los "Nodos Hoja" (Leaf Nodes) del árbol de componentes, específicamente aquellos que necesiten:
  1. Hook `useState` o `useEffect` (ej. Modales, Carousels, Dropdowns).
  2. Modificación de `localStorage` (ej. Panel "Continuar Viendo").
  3. Montar el Iframe de VidSrc (debido a la interacción de red del navegador y posibles UI superpuestas).
  4. Manejo de Eventos (ej. `onClick` en el paginador de la API).

## 2. Abstracción del Data Fetching (Capa de Servicio)

Para evitar ensuciar los componentes de la interfaz con lógica HTTP y para tener un único punto de control de caché, se implementará un patrón de "Services/Fetchers".

### Decisiones Clave:

- **Directorio `lib/tmdb`:** Toda la lógica de negocio y llamadas HTTP a la API de TMDB vivirán aquí.
- **Caché nativa de Next.js (`fetch` patch):**
  - _Portadas, Listas Populares y Metadatos:_ `fetch(url, { next: { revalidate: 3600 } })`. No hay necesidad de consultar TMDB por el mismo catálogo de películas cada segundo. Se almacenará en caché edge por 1 hora.
  - _Resultados de Búsqueda:_ Pueden usar `{ cache: 'no-store' }` si se requiere respuesta en tiempo real, pero es recomendable un revalidate más corto (ej. 60 segundos) si vemos problemas de límite de tasa (rate limiting).
- **Route Handlers (Opcional):** Si el componente cliente necesita invocar paginación o búsqueda (Infinite Scroll), no llamará a TMDB directamente para no exponer la KEY. Llamará a un route handler interno (`/api/movies/search?q=...`) que actuará de proxy, o empleará Server Actions (`"use server"`).

## 3. Arquitectura del Reproductor y "Watch History"

### El Reproductor (VidSrc)

- **Rendimiento y Seguridad:** El iframe se inyectará dinámicamente. Como discutimos en el PRD, si la política estricta de sandbox `sandbox="allow-scripts allow-same-origin allow-presentation"` rompe el flujo del proveedor (por necesidad de popups para carga del video o dependencias cruzadas), se relajará a un estado funcional (añadiendo `allow-popups` si es estrictamente obligatorio), y se inyectará una advertencia de UI gestionando las expectativas del usuario.
- **TV Shows:** El componente de reproducción pasará de ser un solo Iframe a un layout Maestro-Detalle (Iframe arriba, selector de Temporada/Episodios debajo). El selector será un _Client Component_ que, al cambiar de capítulo, actualizará la URL o el estado, y cambiará la URL del `src` del iframe dinámicamente.

### Persistencia del Cliente (LocalStorage)

- **Lógica Atómica:** Crearemos un hook llamado `useWatchHistory.ts` en `hooks/`. Este hook contendrá toda la lógica para leer y escribir en localStorage.
- **Hidratación Segura:** Para evitar errores de deshidratación entre el RSC y el Client (ya que el servidor no tiene `localStorage`), el Client Component que pinte la lista de historial deberá usar un `useEffect` para montar los datos solo **después** del primer renderizado cliente (patrón `isMounted = true`).

## 4. Estructura de Directorios Propuesta

```text
├── app/
│   ├── (main)/               # Route Group para layout con Header/Footer
│   │   ├── page.tsx          # Home: Tendencias, "Continuar Viendo"
│   │   ├── movie/[id]/       # Detalle y Reproductor de Película
│   │   ├── tv/[id]/          # Detalle y Reproductor de Serie
│   │   ├── search/           # Página de resultados
│   │   ├── layout.tsx        # Navegación principal
│   │   ├── error.tsx         # Boundary Global
│   │   └── loading.tsx       # Skeleton global
│   └── api/                  # Proxy interno para Server Actions/Handlers
├── components/
│   ├── ui/                   # Botones, Skeletons, Inputs (Client u "Hojas")
│   ├── providers/            # ThemeProvider (Dark mode opcional)
│   ├── player/               # Iframe de VidSrc y Disclaimers (Client)
│   └── catalog/              # MovieCards, Grid, Carousel (Server/Client mixto)
├── lib/
│   ├── tmdb/                 # Data fetchers a TMDB y mapping
│   │   ├── fetcher.ts        # Lógica central del wrapper de fetch
│   │   ├── movies.ts         # Endpoints de películas
│   │   └── tv.ts             # Endpoints de series (incl. /season)
│   └── utils.ts              # Utilidades de Tailwind (cn, classnames)
├── types/
│   └── index.ts              # Modelos de dominio exactos
└── hooks/
    └── useWatchHistory.ts    # Persistencia en cliente
```

## 5. Decisiones de UI/UX (Design System Base)

- **Paleta y Estilo:** Utilizaremos las clases utilitarias core de Tailwind, enfocándonos en una escala de grises oscuros (para resaltar el contenido multimedia tipo Netflix/HBO).
- **Modo Teatro:** La ruta `/movie/[id]` o `/tv/[id]` forzará un background negro (`bg-black`) independientemente del tema global para maximizar el contraste de la reproducción. No habrá elementos flotantes distractores durante la visualización del Iframe.
