# Architecture Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Routing | Wouter |
| State Management | React Context + TanStack Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
| Backend | Node.js, Express |
| Database | PostgreSQL + Drizzle ORM |
| Real-time | Socket.io |
| Authentication | Email OTP via SendGrid |
| Audio | Howler.js |

## Frontend Architecture

The frontend uses React 18 with TypeScript and is organized around:

- **GameContext** - Manages quiz state, user session, and scoring
- **AudioContext** - Controls background music and sound effects
- **TanStack Query** - Server state management and API caching
- **Wouter** - Lightweight client-side routing

### Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero section, categories, featured games |
| `/quiz` | Quiz | Active quiz with timer and multiple choice |
| `/results` | Results | Score summary, confetti, and sharing |
| `/auth` | Auth | Email OTP login/signup |
| `/battle` | Battle | Real-time PvP matchmaking and battles |
| `/grid-game` | Grid Game | Jeopardy-style multiplayer grid |
| `/leaderboard` | Leaderboard | Global, territory, and country rankings |

## Backend Architecture

The Express server provides:

- RESTful JSON APIs under `/api/*`
- Session management with express-session
- Socket.io for real-time battle communication
- Drizzle ORM for type-safe database queries

## Data Flow

```
Client (React) → API Routes (Express) → Storage Layer (Drizzle) → PostgreSQL
                 ↕
            Socket.io (Battles)
```
