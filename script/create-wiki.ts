import { getUncachableGitHubClient } from '../server/github';

async function createWiki() {
  const octokit = await getUncachableGitHubClient();
  const { data: user } = await octokit.users.getAuthenticated();
  const owner = user.login;
  const repo = 'bible-trivia-show';

  console.log(`Creating wiki pages for ${owner}/${repo}...`);

  const wikiPages = [
    {
      title: 'Home',
      content: `# Bible Trivia Show - Wiki

Welcome to the Bible Trivia Show wiki! This is your complete guide to understanding, running, and contributing to the project.

## Table of Contents

- [Home](Home)
- [Getting Started](Getting-Started)
- [Architecture Overview](Architecture-Overview)
- [Game Modes](Game-Modes)
- [Authentication System](Authentication-System)
- [Database Schema](Database-Schema)
- [API Reference](API-Reference)
- [Deployment Guide](Deployment-Guide)

## About the Project

Bible Trivia Show is a feature-rich Bible quiz web application designed to help believers test and grow their scriptural knowledge through interactive quizzes, multiplayer battles, and a Jeopardy-style grid game.

### Key Features

- **30+ Bible Book Categories** covering Old and New Testament
- **Email OTP Authentication** via SendGrid
- **Real-time PvP Battles** with Socket.io
- **Bible Trivia Grid Game** - Jeopardy-style multiplayer
- **Three-Tier Ranking System** with global and territory leaderboards
- **Gamification** with streaks, scores, and achievements
- **The Messiah's Path** - Special featured journey (Coming Soon)
- **Light/Dark Mode** with cream/ivory themed design
- **Background Music & Sound Effects**
- **Social Sharing** capabilities
`
    },
    {
      title: 'Getting-Started',
      content: `# Getting Started

## Prerequisites

- Node.js 20+
- PostgreSQL database
- SendGrid account (for email OTP)

## Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/${owner}/${repo}.git
cd ${repo}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret
\`\`\`

4. Push the database schema:
\`\`\`bash
npm run db:push
\`\`\`

5. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

The app will be available at \`http://localhost:5000\`.

## Project Structure

\`\`\`
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── context/        # React contexts (Game, Audio)
│   │   ├── lib/            # Utilities, API client, question data
│   │   └── pages/          # Route pages
│   └── index.html
├── server/                 # Backend Express server
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── email.ts            # SendGrid email integration
├── shared/                 # Shared types and schema
│   └── schema.ts           # Drizzle ORM schema
└── package.json
\`\`\`
`
    },
    {
      title: 'Architecture-Overview',
      content: `# Architecture Overview

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
| \`/\` | Home | Hero section, categories, featured games |
| \`/quiz\` | Quiz | Active quiz with timer and multiple choice |
| \`/results\` | Results | Score summary, confetti, and sharing |
| \`/auth\` | Auth | Email OTP login/signup |
| \`/battle\` | Battle | Real-time PvP matchmaking and battles |
| \`/grid-game\` | Grid Game | Jeopardy-style multiplayer grid |
| \`/leaderboard\` | Leaderboard | Global, territory, and country rankings |

## Backend Architecture

The Express server provides:

- RESTful JSON APIs under \`/api/*\`
- Session management with express-session
- Socket.io for real-time battle communication
- Drizzle ORM for type-safe database queries

## Data Flow

\`\`\`
Client (React) → API Routes (Express) → Storage Layer (Drizzle) → PostgreSQL
                 ↕
            Socket.io (Battles)
\`\`\`
`
    },
    {
      title: 'Game-Modes',
      content: `# Game Modes

## 1. Solo Quiz

The primary game mode where players test their Bible knowledge.

- **Categories**: 30+ Bible books (Genesis through Revelation)
- **Questions**: 10 per quiz session
- **Timer**: 30 seconds per question
- **Scoring**: 10 points per correct answer
- **Difficulty**: Easy, Medium, Hard questions mixed

### How It Works

1. Select a Bible book category from the home page
2. Answer 10 multiple-choice questions
3. Earn points for correct answers within the time limit
4. View results with score breakdown and explanations
5. Share your results on social media

## 2. Real-time PvP Battle

Go head-to-head against another player in real-time.

- **Matchmaking**: Automatic via Socket.io
- **Rounds**: 5 rounds per battle
- **Timer**: 15 seconds per round
- **Category**: Player-selected before matching
- **Scoring**: Points based on speed and correctness

### Battle Flow

1. Select a category and enter the queue
2. Get matched with another player
3. Both players see the same question simultaneously
4. Faster correct answers earn more points
5. Winner determined after 5 rounds

## 3. Bible Trivia Grid Game (Jeopardy-Style)

A local multiplayer game inspired by Jeopardy.

- **Players**: 2-6 players on the same device
- **Grid**: 6 columns × 5 rows
- **Difficulty Columns**: 2 Easy (White), 2 Medium (Blue), 2 Hard (Orange)
- **Points**: Range from 10 to 1,050
- **Rounds**: Configurable (1-30)

### Grid Layout

| Easy (White) | Easy (White) | Medium (Blue) | Medium (Blue) | Hard (Orange) | Hard (Orange) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 10 | 70 | 180 | 340 | 550 | 810 |
| 20 | 90 | 210 | 380 | 600 | 870 |
| 30 | 110 | 240 | 420 | 650 | 930 |
| 40 | 130 | 270 | 460 | 700 | 990 |
| 50 | 150 | 300 | 500 | 750 | 1050 |

### Steal Mechanic

When a player answers incorrectly:
1. The system announces a "Steal Opportunity"
2. Any other player can attempt to answer
3. If the stealing player answers correctly, they get the points
4. If they also fail, no one gets points

### Game Over

The game ends when:
- All configured rounds are completed
- All tiles on the grid are cleared

A final leaderboard shows all players ranked by score.

## 4. The Messiah's Path (Coming Soon)

A special journey through the Gospel of Matthew with 18 milestones tracing the life of Jesus from the Manger to the Great Commission.
`
    },
    {
      title: 'Authentication-System',
      content: `# Authentication System

## Overview

Bible Trivia Show uses a passwordless email OTP (One-Time Password) authentication system powered by SendGrid.

## Flow

\`\`\`
1. User enters email → POST /api/auth/send-otp
2. Server generates 6-digit code → Stores in DB with 10-min expiry
3. SendGrid sends branded email → From "Debbie from Bible Trivia Show"
4. User enters OTP code → POST /api/auth/verify-otp
5. Server validates code → Creates session, returns user data
\`\`\`

## Email Configuration

- **Sender Name**: Debbie from Bible Trivia Show
- **Sender Email**: hello@bibletriviashow.com
- **Email Template**: Branded HTML with warm cream/golden color scheme
- **OTP Expiry**: 10 minutes
- **Fallback**: Console logging when SendGrid is unavailable

## API Endpoints

### Send OTP
\`\`\`
POST /api/auth/send-otp
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "OTP sent to your email" }
\`\`\`

### Verify OTP
\`\`\`
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "code": "123456" }
Response: { "success": true, "user": { ... } }
\`\`\`

### Get Current User
\`\`\`
GET /api/auth/me
Response: { "id": 1, "email": "...", "displayName": "..." }
\`\`\`

### Logout
\`\`\`
POST /api/auth/logout
Response: { "success": true }
\`\`\`

## Session Management

- Sessions stored in memory (development) or PostgreSQL (production)
- Session cookie: \`connect.sid\`
- Configurable via \`SESSION_SECRET\` environment variable
`
    },
    {
      title: 'Database-Schema',
      content: `# Database Schema

The application uses PostgreSQL with Drizzle ORM. All table definitions are in \`shared/schema.ts\`.

## Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-incrementing ID |
| email | varchar | Unique email address |
| displayName | varchar | Optional display name |
| avatarUrl | varchar | Optional avatar URL |
| countryId | varchar | Country identifier |
| territoryId | varchar | Territory identifier |
| createdAt | timestamp | Account creation date |

### otpCodes
| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-incrementing ID |
| email | varchar | Target email |
| code | varchar | 6-digit OTP code |
| expiresAt | timestamp | Expiration timestamp |
| used | boolean | Whether code has been used |

### userStats
| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-incrementing ID |
| userId | integer (FK) | Reference to users table |
| totalQuizzes | integer | Total quizzes completed |
| totalScore | integer | Cumulative score |
| totalCorrect | integer | Total correct answers |
| totalQuestions | integer | Total questions attempted |
| currentStreak | integer | Current daily streak |
| bestStreak | integer | Best daily streak achieved |
| lastPlayedAt | timestamp | Last quiz played date |

### quizSessions
| Column | Type | Description |
|--------|------|-------------|
| id | serial (PK) | Auto-incrementing ID |
| userId | integer (FK) | Reference to users table |
| category | varchar | Quiz category |
| score | integer | Session score |
| totalQuestions | integer | Questions in session |
| correctAnswers | integer | Correct answers count |
| completedAt | timestamp | Completion timestamp |

### territories
| Column | Type | Description |
|--------|------|-------------|
| id | varchar (PK) | Territory identifier |
| name | varchar | Territory name |
| region | varchar | Geographic region |
| emblemColor | varchar | Display color code |

## Migrations

Run database migrations with:
\`\`\`bash
npm run db:push
\`\`\`
`
    },
    {
      title: 'API-Reference',
      content: `# API Reference

All API endpoints are prefixed with \`/api\`.

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/auth/send-otp\` | Send OTP code to email |
| POST | \`/api/auth/verify-otp\` | Verify OTP and create session |
| GET | \`/api/auth/me\` | Get current authenticated user |
| POST | \`/api/auth/logout\` | End current session |

## Quiz

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/quiz/questions/:category\` | Get questions for a category |
| POST | \`/api/quiz/submit\` | Submit quiz results |

## User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/user/stats\` | Get current user's stats |
| PATCH | \`/api/user/profile\` | Update user profile |

## Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/leaderboard/global\` | Global top players |
| GET | \`/api/leaderboard/territory/:id\` | Territory rankings |
| GET | \`/api/leaderboard/country/:id\` | Country rankings |

## Geography

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/territories\` | List all territories |
| GET | \`/api/countries\` | List all countries |

## Socket.io Events (Battles)

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| \`join_queue\` | \`{ userId, category }\` | Join battle matchmaking |
| \`submit_answer\` | \`{ answer, timeLeft }\` | Submit battle answer |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| \`matched\` | \`{ opponent, category }\` | Battle match found |
| \`new_round\` | \`{ question, round }\` | New battle round |
| \`round_result\` | \`{ correct, scores }\` | Round outcome |
| \`battle_end\` | \`{ winner, scores }\` | Battle complete |
`
    },
    {
      title: 'Deployment-Guide',
      content: `# Deployment Guide

## Deploying on Replit

The easiest way to deploy Bible Trivia Show is through Replit's built-in publishing:

1. Click the **Publish** button in Replit
2. Replit automatically handles building, hosting, TLS, and health checks
3. Your app will be available at a \`.replit.app\` domain

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| \`DATABASE_URL\` | PostgreSQL connection string |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| \`SESSION_SECRET\` | Session encryption key | Auto-generated |
| \`NODE_ENV\` | Environment mode | \`development\` |

### SendGrid (for email OTP)
Configure via Replit's SendGrid integration connector, which manages:
- API key rotation
- Sender email verification
- Secure secret storage

## Build Commands

| Command | Description |
|---------|-------------|
| \`npm run dev\` | Start development server with HMR |
| \`npm run build\` | Build for production |
| \`npm run db:push\` | Push database schema changes |

## Production Build

The production build process:
1. Vite bundles the React frontend into \`dist/public/\`
2. esbuild compiles the Express server into \`dist/\`
3. The server serves static files from \`dist/public/\`

## Custom Domain

After publishing on Replit, you can configure a custom domain in the deployment settings.

## Contact

- **Email**: hello@bibletriviashow.com
- **Support**: Debbie from Bible Trivia Show
`
    }
  ];

  // GitHub Wiki API uses the Git Data API on the wiki repo
  // We need to use the REST API to create wiki pages
  for (const page of wikiPages) {
    try {
      await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo: `${repo}.wiki`,
        path: `${page.title}.md`,
        message: `Add wiki page: ${page.title}`,
        content: Buffer.from(page.content).toString('base64'),
      });
      console.log(`  Created: ${page.title}`);
    } catch (err: any) {
      // Wiki repo API doesn't work this way - need to use the wiki pages API
      if (err.status === 404) {
        // Try the Pages API instead
        try {
          await octokit.request('POST /repos/{owner}/{repo}/pages', {
            owner,
            repo,
          });
        } catch {}
      }
      console.log(`  Note: ${page.title} - ${err.message || 'will try alternative'}`);
    }
  }

  // Use the proper wiki creation endpoint
  console.log('\nAttempting to create wiki via pages API...');
  for (const page of wikiPages) {
    try {
      await octokit.request('PUT /repos/{owner}/{repo}/wiki/pages/{page_title}', {
        owner,
        repo,
        page_title: page.title,
        content: page.content,
        message: `Create ${page.title} wiki page`,
      } as any);
      console.log(`  Created: ${page.title}`);
    } catch (err: any) {
      console.log(`  ${page.title}: ${err.status || 'error'} - ${err.message?.substring(0, 80) || 'unknown'}`);
    }
  }

  console.log(`\nWiki URL: https://github.com/${owner}/${repo}/wiki`);
  console.log('\nNote: If the API does not support wiki creation directly,');
  console.log('you may need to enable the wiki in your repository settings first,');
  console.log('then create the first page manually at the wiki URL above.');
  console.log('The wiki content has been prepared and can be copy-pasted.');

  // Save wiki content locally for easy access
  const wikiDir = '/home/runner/workspace/wiki';
  const fs = await import('fs');
  if (!fs.existsSync(wikiDir)) fs.mkdirSync(wikiDir, { recursive: true });
  
  for (const page of wikiPages) {
    fs.writeFileSync(`${wikiDir}/${page.title}.md`, page.content);
  }
  console.log(`\nWiki pages saved locally in /wiki/ folder`);
}

createWiki().catch(console.error);
