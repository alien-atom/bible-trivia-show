# Getting Started

## Prerequisites

- Node.js 20+
- PostgreSQL database
- SendGrid account (for email OTP)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alien-atom/bible-trivia-show.git
cd bible-trivia-show
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret
```

4. Push the database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`.

## Project Structure

```
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
```
