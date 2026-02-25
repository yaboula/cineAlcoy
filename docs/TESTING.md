# Testing & Observability Strategy - Cinema App

## 1. Filosofía de Testing

Para una aplicación que depende de APIs externas (TMDB) e iframes de terceros (VidSrc), nuestro enfoque se basa en **controlar lo controlable**: validamos nuestra lógica de negocio, la integridad de los tipos, y los flujos de usuario visibles, sin intentar testear servicios que no nos pertenecen.

### Pirámide de Testing (Adaptada al proyecto)

```
        ╱╲
       ╱E2E╲       → Flujos críticos completos (Playwright)
      ╱──────╲
     ╱Integration╲ → Server Components con mocks de TMDB
    ╱──────────────╲
   ╱   Unit Tests   ╲→ Utilidades, hooks, validadores, mappers
  ╱──────────────────╲
```

---

## 2. Testing Unitario

### Qué testear

| Módulo                     | Archivo Test                        | Qué se valida                                                             |
| -------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| `lib/validation.ts`        | `__tests__/validation.test.ts`      | IDs válidos/inválidos, season/episode numbers                             |
| `lib/tmdb/fetcher.ts`      | `__tests__/tmdb-fetcher.test.ts`    | Construcción correcta de URLs, headers, manejo de errores HTTP            |
| `lib/tmdb/movies.ts`       | `__tests__/tmdb-movies.test.ts`     | Mapping correcto de respuestas crudas a interfaces de dominio             |
| `lib/tmdb/tv.ts`           | `__tests__/tmdb-tv.test.ts`         | Mapping de series, temporadas y episodios                                 |
| `hooks/useWatchHistory.ts` | `__tests__/useWatchHistory.test.ts` | Leer/escribir/borrar de localStorage, límite de 30 items, datos corruptos |
| `lib/utils.ts`             | `__tests__/utils.test.ts`           | Helper de imágenes `getTMDBImageUrl`, className merger                    |

### Herramientas

- **Vitest** — Runner rápido, compatible con Next.js y TypeScript nativo
- **@testing-library/react** — Para hooks y componentes cliente
- **msw (Mock Service Worker)** — Para interceptar las peticiones HTTP en tests de integración sin tocar TMDB real

### Ejemplo de Test Unitario

```typescript
// __tests__/validation.test.ts
import { describe, it, expect } from "vitest";
import { validateTMDBId } from "@/lib/validation";

describe("validateTMDBId", () => {
  it("should return a valid number for a positive integer string", () => {
    expect(validateTMDBId("12345")).toBe(12345);
  });

  it("should throw for a negative number", () => {
    expect(() => validateTMDBId("-1")).toThrow("Invalid TMDB ID");
  });

  it("should throw for a non-numeric string", () => {
    expect(() => validateTMDBId("abc")).toThrow("Invalid TMDB ID");
  });

  it("should throw for a floating point number", () => {
    expect(() => validateTMDBId("1.5")).toThrow("Invalid TMDB ID");
  });

  it("should throw for zero", () => {
    expect(() => validateTMDBId("0")).toThrow("Invalid TMDB ID");
  });
});
```

---

## 3. Testing de Integración (Server Components)

### Estrategia

Los Server Components se testean verificando que:

1. Se construya la URL correcta para TMDB
2. Los datos se transformen (mapeen) correctamente
3. Los errores HTTP se propaguen o manejen gracefully

### Mock de Fetch (MSW)

```typescript
// __tests__/setup.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { mockPopularMovies } from "./fixtures/movies";

export const server = setupServer(
  http.get("https://api.themoviedb.org/3/movie/popular", () => {
    return HttpResponse.json(mockPopularMovies);
  }),
  http.get("https://api.themoviedb.org/3/movie/:id", ({ params }) => {
    if (params.id === "999999") {
      return HttpResponse.json(
        { status_message: "Not Found" },
        { status: 404 },
      );
    }
    return HttpResponse.json(mockMovieDetail);
  }),
);
```

---

## 4. Testing E2E (Playwright)

### Flujos Críticos a Testear

| Test ID  | Flujo                    | Criterio de Aceptación                                                               |
| -------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `E2E-01` | Homepage Load            | La página carga con al menos 1 sección de películas visibles                         |
| `E2E-02` | Navigate to Movie Detail | Click en card → URL cambia a `/movie/[id]` → Se muestra título y sinopsis            |
| `E2E-03` | Player Renders           | En `/movie/[id]`, el iframe de VidSrc está presente en el DOM con `src` correcto     |
| `E2E-04` | Search Flow              | Escribir en barra de búsqueda → Resultados aparecen → Click lleva a detalle          |
| `E2E-05` | Watch History            | Visitar `/movie/[id]` → Volver a Home → Sección "Continuar Viendo" muestra el título |
| `E2E-06` | TV Season Selector       | En `/tv/[id]` → Seleccionar temporada → Lista de episodios se actualiza              |
| `E2E-07` | Error State              | Navegar a `/movie/invalid` → Se muestra pantalla de error amigable                   |
| `E2E-08` | Empty Search             | Buscar término sin resultados → Se muestra Empty State                               |

### Comandos

```bash
# Instalar
npm install -D playwright @playwright/test

# Ejecutar todos los E2E
npx playwright test

# Ejecutar un test específico
npx playwright test e2e/homepage.spec.ts

# Modo visual (debug)
npx playwright test --ui
```

---

## 5. Manejo de Errores (Error Boundaries)

### Árbol de Error Boundaries en App Router

```
app/
├── layout.tsx          → Root layout (sin error boundary aquí)
├── error.tsx           → ⚠️ Catch-all global: "Algo salió mal"
├── not-found.tsx       → 404 global
├── (main)/
│   ├── error.tsx       → ⚠️ Error en catálogo general
│   ├── movie/[id]/
│   │   ├── error.tsx   → ⚠️ "No pudimos cargar esta película"
│   │   └── loading.tsx → Skeleton de detalle
│   ├── tv/[id]/
│   │   ├── error.tsx   → ⚠️ "No pudimos cargar esta serie"
│   │   └── loading.tsx → Skeleton de detalle
│   └── search/
│       ├── error.tsx   → ⚠️ "Error en la búsqueda"
│       └── loading.tsx → Skeleton de resultados
```

### Patrón de error.tsx

```typescript
'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-[#e5e5e5]">
        Algo salió mal
      </h2>
      <p className="text-gray-400 text-sm text-center max-w-md">
        No pudimos cargar el contenido. Esto puede deberse a un problema temporal.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
```

---

## 6. Logging y Observabilidad (Producción)

### Principios

- **No `console.log` en producción** con datos sensibles (API keys, tokens)
- **Structured logging** para errores de fetch (endpoint, status code, timestamp)
- **Metadata de errores** en `error.tsx` usando `error.digest` de Next.js para correlación server-side

### Patrón de Logging (lib/logger.ts)

```typescript
type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

export function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
): void {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    console[level](JSON.stringify(entry, null, 2));
  }
  // En producción: enviar a servicio externo (Sentry, LogTail, etc.)
}
```

---

## 7. Checklist de Testing Pre-Lanzamiento

- [ ] Todos los validadores tienen tests unitarios con edge cases
- [ ] Los mappers de TMDB tienen tests con fixtures reales
- [ ] `useWatchHistory` testeado con localStorage mock
- [ ] MSW configurado para interceptar peticiones de TMDB en tests
- [ ] Al menos 8 tests E2E con Playwright cubriendo flujos críticos
- [ ] Cada ruta dinámica tiene su `error.tsx` y `loading.tsx`
- [ ] Los Skeletons de loading coinciden visualmente con el contenido real
- [ ] Logger estructurado sin datos sensibles en consola
