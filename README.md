# MyRadio

Web-based music playlist application. Reads ID3 tags from local MP3 files, provides audio streaming with seeking, cover art display, and full-text search. Built with Vue 3 + TypeScript + Node.js.

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3003/api`

## Project Structure

```
MyRadio/
├── server/                     # Express + TypeScript backend
│   └── src/
│       ├── index.ts            # Entry point, bootstraps scanner + cache
│       ├── app.ts              # Express app factory
│       ├── config.ts           # Environment config
│       ├── services/
│       │   ├── scanner.service.ts   # Directory walk + ID3 tag parsing
│       │   ├── cache.service.ts     # JSON file cache with staleness check
│       │   └── stream.service.ts    # Audio streaming with Range support
│       ├── routes/
│       │   ├── songs.routes.ts      # CRUD + search + rescan
│       │   └── stream.routes.ts     # Audio streaming + cover art
│       ├── middleware/
│       │   └── error-handler.ts
│       └── types/
│           ├── song.ts              # SongMetadata interface
│           ├── cache.ts             # CacheManifest interface
│           └── api.ts               # Request/response types
├── client/                     # Vue 3 + Vite frontend
│   └── src/
│       ├── main.ts
│       ├── App.vue             # Root layout (header / content / player-bar)
│       ├── router/
│       ├── stores/
│       │   ├── player.store.ts       # Playback state, queue, shuffle/repeat
│       │   ├── library.store.ts      # Song library, search filtering
│       │   └── ui.store.ts           # Sidebar, view mode
│       ├── api/
│       │   └── client.ts             # Axios wrapper for REST API
│       ├── composables/
│       │   └── useKeyboard.ts        # Keyboard shortcuts
│       ├── components/
│       │   ├── layout/               # AppHeader, PlayerBar
│       │   ├── player/               # PlayerControls, ProgressBar, VolumeControl, NowPlaying
│       │   ├── library/              # SongCard, SongGrid, SearchBar
│       │   └── common/               # Spinner, EmptyState
│       ├── views/
│       │   └── HomeView.vue
│       ├── styles/
│       │   ├── variables.css         # CSS custom properties
│       │   ├── reset.css
│       │   └── global.css
│       └── types/
│           └── index.ts
└── ARCHITECTURE.md              # Architecture design document
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/songs` | List all songs. Query: `search`, `sort` (title/artist/duration), `order` (asc/desc) |
| GET | `/api/songs/:id` | Get single song metadata |
| GET | `/api/stream/:id` | Stream audio with HTTP Range support (seeking) |
| GET | `/api/stream/:id/cover` | Get embedded cover art (JPEG/PNG) |
| POST | `/api/songs/rescan` | Force re-scan music directory and invalidate cache |
| GET | `/api/status` | Health check, song count, music directory |

## Configuration

Environment variables (or `.env` file):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3003` | Server port |
| `MUSIC_DIR` | `/run/media/aoralsfout/文件/学长音乐精选/` | Path to MP3 files |
| `NODE_ENV` | `development` | `production` enables static file serving |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for CORS |

## Production Build

```bash
npm run build
NODE_ENV=production node server/dist/index.js
```

The Express server serves both the API and the compiled Vue frontend from a single process.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| ← → | Seek ±5s |
| ↑ ↓ | Volume ±5% |

## Tech Stack

- **Backend**: Express 5, music-metadata, uuid, tsx
- **Frontend**: Vue 3.5, Pinia 2, Vue Router 4, Axios, Vite 6
- **Language**: TypeScript 5.7
- **Runtime**: Node.js 26+
