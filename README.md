<div align="center">

# 🎬 Cinema

**A modern streaming discovery platform built with Next.js 16, React 19, and Supabase.**

Browse trending movies & TV shows, search the TMDB catalog, track your watchlist, and stream content — all wrapped in a sleek, dark-themed UI.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_+_DB-3FCF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://vercel.com/)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| **TMDB Catalog** | Browse Now Playing, Trending, Top Rated movies and Popular TV shows with server-side fetching and caching |
| **Multi-Source Player** | 4 embedded player sources (VidSrc, 2Embed, SuperEmbed, SmashyStream) with click-to-play gate and popup blocker |
| **Smart Search** | Real-time search with debounced suggestions, media type filters (All / Movies / TV), and empty-state guidance |
| **Watchlist** | Save movies & shows to a personal watchlist synced to Supabase with optimistic UI updates |
| **Watch History** | Automatic tracking of watch progress with resume-from-position support |
| **User Profiles** | Email/password authentication via Supabase Auth with avatar, display name, and user stats |
| **Responsive Dark UI** | Fully responsive from mobile to 4K, dark-only theme with Framer Motion animations |
| **Continue Watching** | Smart row showing in-progress content with progress bars |
| **TV Episode Browser** | Season/episode selector for TV shows with episode metadata |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                       │
│  ┌───────────────────────────────────────────────┐  │
│  │           Next.js 16 App Router               │  │
│  │         (React Server Components)             │  │
│  │                                               │  │
│  │  Server Components ──► TMDB API (cached)      │  │
│  │  Server Actions    ──► Search / Suggestions   │  │
│  │  Client Components ──► Supabase (RLS)         │  │
│  │  Iframe Player     ──► VidSrc / 2Embed / ...  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   ┌───────────┐           ┌──────────────┐
   │  TMDB API │           │   Supabase   │
   │  (v3 REST)│           │  PostgreSQL  │
   │  read-only│           │  + Auth + RLS│
   └───────────┘           └──────────────┘
```

### Key Principles

- **Server-first rendering** — TMDB data is fetched in React Server Components; API keys never reach the client
- **Row-Level Security** — Every Supabase table uses RLS policies scoped to `auth.uid()`
- **Progressive enhancement** — Pages load with Suspense skeletons, then stream in content
- **Multi-source resilience** — If one player source fails, users can switch to an alternative instantly

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (main)/              # Route group with shared layout
│   │   ├── page.tsx         # Homepage — Trending, Now Playing, Top Rated, Popular TV
│   │   ├── movie/[id]/      # Movie detail + player
│   │   ├── tv/[id]/         # TV show detail + episode player
│   │   ├── movies/          # Movies catalog with pagination
│   │   ├── series/          # TV series catalog with pagination
│   │   ├── search/          # Search page with filters
│   │   └── watchlist/       # User's saved watchlist
│   └── actions/             # Server Actions (search, TMDB helpers)
├── components/
│   ├── catalog/             # Domain components (HeroBanner, MediaCard, SearchPageClient…)
│   ├── player/              # VideoPlayer, TVPlayerSection, WatchHistorySaver
│   ├── providers/           # AuthProvider, ProfileProvider (React Context)
│   └── ui/                  # Reusable primitives (Header, Footer, SearchBar, skeletons…)
├── hooks/                   # Custom hooks (useWatchlist, useWatchHistory, useProfile…)
├── lib/
│   ├── tmdb/                # TMDB API client layer (fetcher, movies, tv, search, genres)
│   ├── supabase/            # Supabase client + query modules (watchlist, watch-history…)
│   ├── utils.ts             # cn() helper, formatters
│   └── validation.ts        # Input sanitization & validation
└── types/                   # Shared TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or pnpm / yarn)
- A [TMDB account](https://www.themoviedb.org/settings/api) for API keys
- A [Supabase project](https://supabase.com/dashboard) for auth & database

### 1. Clone the repository

```bash
git clone https://github.com/yaboula/cineAlcoy.git
cd cineAlcoy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# TMDB — get your keys at https://www.themoviedb.org/settings/api
TMDB_API_KEY=your_tmdb_api_key
TMDB_ACCESS_TOKEN=your_tmdb_access_token

# Supabase — from your project's Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Security note:** `TMDB_API_KEY` and `TMDB_ACCESS_TOKEN` are server-only — they are never exposed to the browser. Supabase keys are public (anon) and rely on Row-Level Security for protection.

### 4. Set up the database

Run the schema in your Supabase SQL Editor:

```sql
-- Execute the contents of supabase/schema.sql
-- This creates 5 tables with RLS policies:
--   profiles, watch_history, watchlist, user_stats, genre_preferences
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app runs with Turbopack for fast HMR.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🧪 Testing

The project uses a layered testing strategy:

| Layer | Tool | Command |
|---|---|---|
| **Unit / Integration** | Vitest + Testing Library + MSW | `npx vitest` |
| **End-to-End** | Playwright | `npx playwright test` |

```bash
# Run unit tests
npx vitest

# Run unit tests with coverage
npx vitest --coverage

# Run E2E tests (requires dev server running)
npx playwright test

# Run E2E with UI
npx playwright test --ui
```

---

## 🔒 Security

- **Content Security Policy** — Strict CSP headers configured in `next.config.ts`
- **Iframe sandboxing** — Player iframes use `sandbox` and `referrerpolicy` attributes
- **Server-side secrets** — TMDB API keys are used only in server components / actions
- **Row-Level Security** — All Supabase tables enforce `auth.uid()` ownership checks
- **Input validation** — Search queries and IDs are sanitized before use
- **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` set globally

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full threat model.

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Background** | `#0a0a0a` (Jet Black) |
| **Surface** | `#141414` (Card Dark) |
| **Primary Accent** | `#6366f1` (Indigo-500) |
| **Text** | `#f5f5f5` / `#a3a3a3` |
| **Font** | Inter (400, 500, 600, 700) |
| **Border Radius** | `0.75rem` (cards), `9999px` (pills) |

Full design tokens, component specs, and animation guidelines in [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

---

## 📚 Documentation

| Document | Description |
|---|---|
| [`docs/PRD.md`](docs/PRD.md) | Product Requirements Document |
| [`docs/API_SPEC.md`](docs/API_SPEC.md) | TMDB API integration & data models |
| [`docs/UI_BLUEPRINT.md`](docs/UI_BLUEPRINT.md) | Screen-by-screen UI specifications |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Colors, typography, components |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Threat model & security controls |
| [`docs/TESTING.md`](docs/TESTING.md) | Testing strategy & pyramid |
| [`docs/ADR.md`](docs/ADR.md) | Architecture Decision Records |
| [`docs/SPRINTS.md`](docs/SPRINTS.md) | Sprint roadmap & milestones |

---

## 🗄️ Database Schema

Five tables with full Row-Level Security:

| Table | Purpose |
|---|---|
| `profiles` | User display name, avatar URL, preferences |
| `watch_history` | Tracks last position, duration, computed progress % |
| `watchlist` | Saved movies/shows per user |
| `user_stats` | Aggregated watch time, total watched, streaks |
| `genre_preferences` | Per-user genre affinity scores |

Schema definition: [`supabase/schema.sql`](supabase/schema.sql)

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| UI Library | React 19.2.3 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Carousel | Embla Carousel |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| API | TMDB v3 |
| Testing | Vitest · Testing Library · Playwright · MSW |
| Deployment | Vercel |

---

## 📄 License

This project is for educational and personal use. TMDB data is provided under the [TMDB Terms of Use](https://www.themoviedb.org/terms-of-use).

---

<div align="center">

Built with ☕ and Next.js

</div>
