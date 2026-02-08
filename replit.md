# Clash of Sages - Bible Trivia Battle

## Overview

Clash of Sages is a Bible trivia web application that helps believers test and grow their scriptural knowledge through interactive quizzes. The app features multiple-choice questions covering both Old and New Testament books, user authentication via email OTP, progress tracking with stats, territory-based leaderboards, and gamification elements like streaks and scores.

### Bible Trivia Grid Game (Feb 2026)
- **Route**: `/grid-game`
- **Type**: Local multiplayer Jeopardy-style Bible trivia grid game
- **Features**: 6-column grid (Easy/Medium/Hard), 2-6 players, configurable rounds, steal mechanic for incorrect answers, scoreboard, game over leaderboard
- **Question DB**: `client/src/lib/grid-game-questions.ts` (90 questions across 3 difficulties)
- **Page**: `client/src/pages/grid-game.tsx` (self-contained with 4 phases: setup, grid, question modal, game over)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: React Context (GameContext) for quiz state, TanStack Query for server state
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Session Management**: Express-session with MemoryStore (development), connect-pg-simple ready for production
- **Authentication**: Passwordless email OTP flow (code sent to console in development)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, otpCodes, userStats, quizSessions, territories
- **Migrations**: Drizzle Kit with `db:push` command

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` folder are imported by both client and server
- **Quiz Data**: Currently uses mock data in `client/src/lib/mock-data.ts` with question banks stored in attached_assets
- **API Client**: Centralized API functions in `client/src/lib/api.ts`
- **Component Structure**: UI primitives in `components/ui/`, feature components at `components/` root level

### Build & Deployment
- **Development**: `npm run dev` starts Express server with Vite middleware for HMR
- **Production**: `npm run build` bundles client with Vite and server with esbuild into `dist/`
- **Static Serving**: Production serves client from `dist/public/`

## External Dependencies

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with Zod schema validation

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for transitions
- **canvas-confetti**: Celebration effects on quiz completion
- **Radix UI**: Accessible component primitives (via shadcn/ui)
- **howler**: Audio library for sound effects and background music

### Audio System
- **AudioContext**: React context in `client/src/context/AudioContext.tsx` manages all audio
- **Background Music**: Three modes (menu, quiz, battle) with looping tracks from Pixabay CDN
- **Sound Effects**: Click, correct/wrong answers, win/lose, tick warnings, timeout, battle/quiz start
- **User Preferences**: Music and SFX enabled states persisted in localStorage
- **Mute Toggle**: Header button controls both music and sound effects

### Development Tools
- **Vite**: Development server and bundler
- **@replit/vite-plugin-***: Replit-specific development features (cartographer, dev-banner, runtime-error-modal)

### Session & Auth
- **express-session**: Session management
- **memorystore**: In-memory session store for development
- **connect-pg-simple**: PostgreSQL session store (available for production)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: (optional) Session encryption key, has default fallback