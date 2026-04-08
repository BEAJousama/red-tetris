# Red Tetris

A real-time multiplayer Tetris game built with React, Node.js, and Socket.io.

## Features

- **Solo mode** – practice and improve your skills against the clock
- **Battle mode** – compete head-to-head against other players in real-time
- **Game modifiers** – choose a twist before each match:
  - **Standard** – classic Tetris physics
  - **Stealth** – pieces turn invisible after placement
  - **Storm** – gravity increases sharply over time
- **Leaderboard** – top scores are persisted across sessions

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Redux Toolkit, React Router, Tailwind CSS, Vite |
| Backend | Node.js, TypeScript, Express, Socket.io |
| Database | SQLite via `better-sqlite3` |
| Containerisation | Docker / Docker Compose |

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm

### Development

**Backend**

```bash
cd server
npm install
# copy the example env file and edit as needed
cp .env.example .env
npm run dev        # starts with nodemon on port 3000
```

**Frontend**

```bash
cd client
npm install
npm run dev        # Vite dev server (proxies API to localhost:3000)
```

Open `http://localhost:5173` in your browser.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the backend listens on |
| `CLIENT_ORIGIN` | `*` | Allowed CORS origin(s) for the API and Socket.io server |

For the frontend, create `client/.env.local`:

```
VITE_API_URL=http://localhost:3000
```

Leave `VITE_API_URL` empty (or unset) in production when the client is served from the same origin as the API.

## Running with Docker

```bash
# build and start the container (serves both API and built frontend on port 3000)
docker compose up --build
```

The compose file mounts `./data` into the container so the SQLite database persists across restarts.

## Project Structure

```
red-tetris/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/   # Welcome, SoloGame, MultiGame, Leaderboard
│       ├── store/   # Redux slices
│       ├── socket/  # Socket.io client helpers
│       ├── hooks/   # Custom React hooks
│       └── utils/   # Constants, helpers, types
├── server/          # Express + Socket.io backend
│   └── src/
│       ├── game/    # Game engine, Room, Player, scoring logic
│       ├── db.ts    # SQLite leaderboard persistence
│       ├── roomManager.ts
│       └── index.ts # HTTP + WebSocket entry point
├── compose.yaml
├── dockerfile
└── render.yaml      # Render deployment blueprint
```

## Gameplay

### Controls

| Key | Action |
|---|---|
| `←` / `→` | Move piece left / right |
| `↓` | Soft drop |
| `↑` | Rotate piece |
| `Space` | Hard drop |

### Scoring

| Lines cleared | Base points |
|---|---|
| 1 | 100 |
| 2 | 300 |
| 3 | 500 |
| 4 (Tetris) | 800 |

Points are multiplied by the current level. A new level is reached every **5 lines** cleared.

## Deployment

The project is set up for a split deployment:

- **Backend** – [Render](https://render.com) using `render.yaml` (`server/` root dir)
- **Frontend** – [Vercel](https://vercel.com) using `client/vercel.json`

After deploying the backend, set the `CLIENT_ORIGIN` environment variable in the Render dashboard to your Vercel frontend URL, and set `VITE_API_URL` in Vercel to your Render backend URL.

## Scripts

### Client (`client/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |
| `npm run coverage` | Run tests with coverage report |

### Server (`server/`)

| Script | Description |
|---|---|
| `npm run dev` | Start backend with nodemon (hot-reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production build |
| `npm run test` | Run Jest test suite |
| `npm run coverage` | Run tests with coverage report |

## License

ISC
