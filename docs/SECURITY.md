# Security & Privacy Model - Cinema App

## 1. Modelo de Amenazas (Threat Model)

### 1.1. Superficie de Ataque

| Vector                                    | Riesgo                                                   | Mitigación                                                                                                                       |
| ----------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Exposición de API Key TMDB                | Alto — Cualquiera podría abusar de nuestra cuota         | Todas las llamadas a TMDB se hacen server-side. La key vive exclusivamente en `.env.local` y nunca se prefija con `NEXT_PUBLIC_` |
| Iframe de VidSrc (XSS/Clickjacking)       | Medio — El iframe externo ejecuta scripts no controlados | Atributo `sandbox` restrictivo. CSP configurada. No se intenta leer/escribir el DOM del iframe                                   |
| Inyección en URL dinámica (`/movie/[id]`) | Medio — IDs malformados podrían inyectar rutas           | Validación estricta: el parámetro `id` debe ser un entero positivo antes de usarse en cualquier fetch                            |
| localStorage Tampering                    | Bajo — Un usuario podría modificar su propio historial   | No hay impacto de seguridad ya que los datos son solo del cliente. Se valida la estructura al leer                               |

---

## 2. Gestión de Secretos (Environment Variables)

### Regla de Oro

```
✅ TMDB_API_KEY        → Solo server-side (sin prefijo NEXT_PUBLIC_)
✅ TMDB_ACCESS_TOKEN   → Solo server-side (sin prefijo NEXT_PUBLIC_)
❌ NEXT_PUBLIC_TMDB_*  → PROHIBIDO. Nunca exponer la key al bundle del cliente.
```

### Archivo `.env.local` (NO se commitea)

```env
TMDB_API_KEY=tu_api_key_aqui
TMDB_ACCESS_TOKEN=tu_bearer_token_aqui
```

### Archivo `.env.example` (SÍ se commitea, como referencia)

```env
TMDB_API_KEY=
TMDB_ACCESS_TOKEN=
```

### `.gitignore` (Obligatorio)

```gitignore
.env
.env.local
.env.*.local
```

---

## 3. Content Security Policy (CSP)

La CSP debe configurarse en `next.config.ts` o en los headers de middleware para controlar qué orígenes pueden cargar scripts, frames e imágenes en nuestra aplicación.

### Headers Recomendados

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Prevenir que NUESTRA app sea embebida en iframes ajenos
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js necesita inline scripts
              "style-src 'self' 'unsafe-inline'", // Tailwind inyecta estilos
              "img-src 'self' https://image.tmdb.org data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src https://vidsrc.to https://vidsrc.me https://vidsrc.xyz https://vidsrc.in", // Solo el proveedor de video
              "connect-src 'self' https://api.themoviedb.org",
            ].join("; "),
          },
        ],
      },
    ];
  },
};
```

---

## 4. Política de Sandbox del Iframe

### Nivel 1: Estricto (Default — Probar primero)

```html
<iframe
  src="https://vidsrc.to/embed/movie/{id}"
  sandbox="allow-scripts allow-same-origin allow-presentation"
  referrerpolicy="no-referrer"
  loading="lazy"
/>
```

### Nivel 2: Relajado (Si el Nivel 1 bloquea la reproducción)

```html
<iframe
  src="https://vidsrc.to/embed/movie/{id}"
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-popups-to-escape-sandbox"
  referrerpolicy="no-referrer"
  loading="lazy"
/>
```

> [!WARNING]
> Si se requiere Nivel 2, se debe mostrar un **Disclaimer de UI** junto al reproductor:
> _"Este reproductor externo puede mostrar ventanas emergentes. Recomendamos usar un bloqueador de anuncios (uBlock Origin)."_

---

## 5. Validación de Inputs en Rutas Dinámicas

Toda ruta dinámica (`/movie/[id]`, `/tv/[id]`) debe validar los parámetros **antes** de hacer cualquier petición de datos.

```typescript
// lib/validation.ts

export function validateTMDBId(id: string): number {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid TMDB ID: "${id}"`);
  }
  return parsed;
}

export function validateSeasonNumber(season: string): number {
  const parsed = Number(season);
  if (!Number.isInteger(parsed) || parsed < 0) {
    // Temporada 0 = Specials en TMDB
    throw new Error(`Invalid season number: "${season}"`);
  }
  return parsed;
}

export function validateEpisodeNumber(episode: string): number {
  const parsed = Number(episode);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid episode number: "${episode}"`);
  }
  return parsed;
}
```

---

## 6. Protección de localStorage

```typescript
// hooks/useWatchHistory.ts — Fragmento de seguridad

function safeGetHistory(): WatchHistoryItem[] {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Validar cada elemento tiene la estructura esperada
    return parsed.filter(
      (item): item is WatchHistoryItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.tmdb_id === "number" &&
        typeof item.title === "string" &&
        (typeof item.poster_path === "string" || item.poster_path === null) &&
        (item.type === "movie" || item.type === "tv") &&
        typeof item.timestamp === "number",
    );
  } catch {
    // localStorage deshabilitado o datos corruptos
    return [];
  }
}
```

---

## 7. Checklist de Seguridad Pre-Lanzamiento

- [ ] `.env.local` está en `.gitignore`
- [ ] Ninguna variable de entorno usa el prefijo `NEXT_PUBLIC_TMDB`
- [ ] CSP headers configurados en `next.config.ts`
- [ ] Iframe usa `sandbox` con el nivel mínimo funcional
- [ ] Todas las rutas dinámicas validan sus parámetros
- [ ] `localStorage` se lee con `try/catch` y validación de schema
- [ ] `X-Frame-Options: DENY` previene que nuestra app sea embebida
- [ ] No hay `console.log` con datos sensibles en producción
