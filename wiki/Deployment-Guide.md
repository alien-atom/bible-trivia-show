# Deployment Guide

## Deploying on Replit

The easiest way to deploy Bible Trivia Show is through Replit's built-in publishing:

1. Click the **Publish** button in Replit
2. Replit automatically handles building, hosting, TLS, and health checks
3. Your app will be available at a `.replit.app` domain

## Environment Variables

### Required
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |

### Optional
| Variable | Description | Default |
|----------|-------------|---------|
| `SESSION_SECRET` | Session encryption key | Auto-generated |
| `NODE_ENV` | Environment mode | `development` |

### SendGrid (for email OTP)
Configure via Replit's SendGrid integration connector, which manages:
- API key rotation
- Sender email verification
- Secure secret storage

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run db:push` | Push database schema changes |

## Production Build

The production build process:
1. Vite bundles the React frontend into `dist/public/`
2. esbuild compiles the Express server into `dist/`
3. The server serves static files from `dist/public/`

## Custom Domain

After publishing on Replit, you can configure a custom domain in the deployment settings.

## Contact

- **Email**: hello@bibletriviashow.com
- **Support**: Debbie from Bible Trivia Show
