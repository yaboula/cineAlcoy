# Design System & UI/UX Guidelines - Cinema App

## 1. Filosofía de Diseño

La interfaz de Cinema debe transmitir una sensación **premium, inmersiva y cinematográfica**, inspirada en plataformas de referencia como Netflix, Disney+ y HBO Max. El contenido multimedia (pósters, backdrops) es el protagonista absoluto; la UI debe actuar como un "marco oscuro" que lo realce.

### Principios

1. **Content-First:** El contenido visual (imágenes, video) siempre domina. Los elementos de UI son secundarios.
2. **Dark by Default:** Toda la paleta se basa en tonos oscuros. El modo claro no está contemplado en esta fase.
3. **Motion with Purpose:** Las animaciones existen para guiar la atención, no para decorar. Transiciones suaves, no excesivas.
4. **Responsive & Mobile-First:** Diseñamos para móvil primero y escalamos hacia desktop.

---

## 2. Paleta de Colores (Tailwind Config)

### Colores Base (Dark Theme)

| Token            | Hex       | Uso                         | Clase Tailwind       |
| ---------------- | --------- | --------------------------- | -------------------- |
| `background`     | `#0a0a0f` | Fondo principal de la app   | `bg-[#0a0a0f]`       |
| `surface`        | `#141420` | Cards, paneles, secciones   | `bg-[#141420]`       |
| `surface-hover`  | `#1c1c2e` | Hover en cards interactivas | `hover:bg-[#1c1c2e]` |
| `border`         | `#2a2a3d` | Bordes sutiles              | `border-[#2a2a3d]`   |
| `text-primary`   | `#e5e5e5` | Texto principal             | `text-[#e5e5e5]`     |
| `text-secondary` | `#9ca3af` | Texto secundario, metadata  | `text-gray-400`      |
| `text-muted`     | `#6b7280` | Texto terciario, hints      | `text-gray-500`      |

### Colores de Acento

| Token            | Hex          | Uso                                | Clase Tailwind         |
| ---------------- | ------------ | ---------------------------------- | ---------------------- |
| `accent-primary` | `#6366f1`    | CTAs, enlaces activos, focus rings | `text-indigo-500`      |
| `accent-hover`   | `#818cf8`    | Hover de botones primarios         | `hover:bg-indigo-400`  |
| `accent-glow`    | `#6366f1/20` | Glow sutil en cards destacadas     | `shadow-indigo-500/20` |
| `rating-star`    | `#fbbf24`    | Estrellas de valoración TMDB       | `text-amber-400`       |
| `destructive`    | `#ef4444`    | Errores, alertas                   | `text-red-500`         |
| `success`        | `#22c55e`    | Confirmaciones                     | `text-green-500`       |

### Gradientes Clave

```css
/* Hero backdrop overlay (de transparente a fondo) */
bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent

/* Card hover glow */
bg-gradient-to-br from-indigo-500/10 to-transparent
```

---

## 3. Tipografía

### Fuente Principal

**Inter** (Google Fonts) — Neutra, moderna, excelente legibilidad en pantallas.

```html
<!-- app/layout.tsx -->
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### Escala Tipográfica

| Elemento                 | Clase Tailwind                                     | Peso |
| ------------------------ | -------------------------------------------------- | ---- |
| H1 (Título de película)  | `text-3xl md:text-5xl font-bold`                   | 700  |
| H2 (Sección "Populares") | `text-xl md:text-2xl font-semibold`                | 600  |
| H3 (Subsección)          | `text-lg font-semibold`                            | 600  |
| Body (Sinopsis)          | `text-sm md:text-base font-normal leading-relaxed` | 400  |
| Caption (Fecha, runtime) | `text-xs text-gray-400`                            | 400  |
| Badge (Género)           | `text-xs font-medium px-2 py-0.5 rounded-full`     | 500  |

---

## 4. Componentes UI Core

### 4.1. Movie/TV Card

```
┌──────────────────┐
│                  │
│   [Poster IMG]   │  ← aspect-[2/3], object-cover, rounded-lg
│                  │
│                  │
├──────────────────┤
│ Title            │  ← text-sm font-medium, truncate
│ 2024 · ★ 8.2    │  ← text-xs text-gray-400
└──────────────────┘
```

**Comportamiento:**

- Hover: `scale-105` + `shadow-xl shadow-indigo-500/10` con `transition-transform duration-300`
- Fallback si no hay poster: Fondo `bg-[#1c1c2e]` + ícono de película SVG centrado + título

### 4.2. Hero Banner (Homepage)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           [Backdrop Image - Full Width]              │
│                                                     │
│  ┌───────────────────────────┐                      │
│  │ Título de la película     │  ← Gradient overlay  │
│  │ Sinopsis truncada...      │     from bottom       │
│  │ [▶ Ver ahora] [+ Info]    │                      │
│  └───────────────────────────┘                      │
└─────────────────────────────────────────────────────┘
```

**Estilo:** `relative h-[60vh] md:h-[80vh]` con `<Image fill className="object-cover" />` y gradient overlay absoluto.

### 4.3. Skeleton (Loading State)

```
┌──────────────────┐    ← animate-pulse bg-[#1c1c2e]
│                  │       rounded-lg
│   ░░░░░░░░░░░░   │       aspect-[2/3]
│   ░░░░░░░░░░░░   │
│                  │
├──────────────────┤
│ ░░░░░░░░░░       │    ← h-4 w-3/4 rounded
│ ░░░░░░           │    ← h-3 w-1/2 rounded
└──────────────────┘
```

### 4.4. Empty State

```
┌─────────────────────────────────────────┐
│                                         │
│            🎬 (Ícono SVG)               │
│                                         │
│     No se encontraron resultados        │  ← text-lg text-gray-400
│     Prueba con otro término de          │
│           búsqueda                      │
│                                         │
│        [Explorar catálogo]              │  ← Botón CTA indigo
│                                         │
└─────────────────────────────────────────┘
```

---

## 5. Layout & Grid System

### Homepage Grid (Filas de contenido)

```
Sección "Tendencias"
├── Mobile:   grid-cols-2 gap-3
├── Tablet:   grid-cols-3 gap-4
├── Desktop:  grid-cols-5 gap-5
└── Wide:     grid-cols-6 gap-6

Clase: grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4
```

### Página de Detalle (Movie/TV)

```
Mobile:  Stack vertical (Poster → Info → Player → Recomendaciones)
Desktop:
┌──────────────────────────────────────────────────┐
│ [Backdrop Hero - Full width]                     │
├─────────────────┬────────────────────────────────┤
│  [Poster]       │  Título, Géneros, Rating       │
│  aspect-[2/3]   │  Sinopsis                      │
│  w-64           │  Cast (horizontal scroll)      │
├─────────────────┴────────────────────────────────┤
│ [Reproductor VidSrc - 16:9 aspect]               │
├──────────────────────────────────────────────────┤
│ Recomendaciones (grid horizontal)                │
└──────────────────────────────────────────────────┘
```

### Reproductor (Theater Mode)

```
┌──────────────────────────────────────────────────┐
│ bg-black                                         │
│ ┌──────────────────────────────────────────────┐ │
│ │                                              │ │
│ │          [IFRAME - aspect-video]             │ │  ← max-w-5xl mx-auto
│ │          16:9 responsive                     │ │
│ │                                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Selector de Temporada ▼] [E1] [E2] [E3] ...    │  ← Solo para TV Shows
│                                                  │
└──────────────────────────────────────────────────┘

Clase iframe: w-full aspect-video rounded-lg
Container: bg-black py-8 px-4
```

---

## 6. Espaciado y Breakpoints

### Espaciado (siguiendo la escala de Tailwind 4px)

| Uso                         | Valor | Clase      |
| --------------------------- | ----- | ---------- |
| Padding de página (mobile)  | 16px  | `px-4`     |
| Padding de página (desktop) | 48px  | `lg:px-12` |
| Gap entre cards             | 16px  | `gap-4`    |
| Separación entre secciones  | 48px  | `py-12`    |
| Padding interno de card     | 12px  | `p-3`      |

### Breakpoints (Tailwind defaults)

| Nombre | Ancho  | Uso              |
| ------ | ------ | ---------------- |
| `sm`   | 640px  | Tablet portrait  |
| `md`   | 768px  | Tablet landscape |
| `lg`   | 1024px | Desktop          |
| `xl`   | 1280px | Desktop wide     |
| `2xl`  | 1536px | Ultra wide       |

---

## 7. Animaciones y Transiciones

| Elemento           | Propiedad    | Clase Tailwind                                        |
| ------------------ | ------------ | ----------------------------------------------------- |
| Card hover zoom    | `transform`  | `transition-transform duration-300 hover:scale-105`   |
| Card hover shadow  | `box-shadow` | `transition-shadow duration-300 hover:shadow-xl`      |
| Skeleton pulse     | `opacity`    | `animate-pulse`                                       |
| Fade-in de páginas | `opacity`    | Custom: `animate-fadeIn` (definir en tailwind.config) |
| Navegación         | `background` | `transition-colors duration-200`                      |

### Custom Animation (tailwind.config.ts)

```typescript
extend: {
  animation: {
    'fadeIn': 'fadeIn 0.5s ease-in-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0', transform: 'translateY(8px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
  },
}
```

---

## 8. Accesibilidad (a11y) Base

- Todos los elementos interactivos deben tener `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`
- Las imágenes de póster deben tener `alt={title}` descriptivo
- Los botones de navegación del selector de episodios deben incluir `aria-label`
- Contraste mínimo ratio `4.5:1` para texto normal (WCAG AA)
- El iframe del reproductor debe tener `title="Video Player"`
