# Authentication System

## Overview

Bible Trivia Show uses a passwordless email OTP (One-Time Password) authentication system powered by SendGrid.

## Flow

```
1. User enters email → POST /api/auth/send-otp
2. Server generates 6-digit code → Stores in DB with 10-min expiry
3. SendGrid sends branded email → From "Debbie from Bible Trivia Show"
4. User enters OTP code → POST /api/auth/verify-otp
5. Server validates code → Creates session, returns user data
```

## Email Configuration

- **Sender Name**: Debbie from Bible Trivia Show
- **Sender Email**: hello@bibletriviashow.com
- **Email Template**: Branded HTML with warm cream/golden color scheme
- **OTP Expiry**: 10 minutes
- **Fallback**: Console logging when SendGrid is unavailable

## API Endpoints

### Send OTP
```
POST /api/auth/send-otp
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "OTP sent to your email" }
```

### Verify OTP
```
POST /api/auth/verify-otp
Body: { "email": "user@example.com", "code": "123456" }
Response: { "success": true, "user": { ... } }
```

### Get Current User
```
GET /api/auth/me
Response: { "id": 1, "email": "...", "displayName": "..." }
```

### Logout
```
POST /api/auth/logout
Response: { "success": true }
```

## Session Management

- Sessions stored in memory (development) or PostgreSQL (production)
- Session cookie: `connect.sid`
- Configurable via `SESSION_SECRET` environment variable
