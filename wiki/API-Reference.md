# API Reference

All API endpoints are prefixed with `/api`.

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP code to email |
| POST | `/api/auth/verify-otp` | Verify OTP and create session |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | End current session |

## Quiz

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/questions/:category` | Get questions for a category |
| POST | `/api/quiz/submit` | Submit quiz results |

## User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/stats` | Get current user's stats |
| PATCH | `/api/user/profile` | Update user profile |

## Leaderboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/global` | Global top players |
| GET | `/api/leaderboard/territory/:id` | Territory rankings |
| GET | `/api/leaderboard/country/:id` | Country rankings |

## Geography

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/territories` | List all territories |
| GET | `/api/countries` | List all countries |

## Socket.io Events (Battles)

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `join_queue` | `{ userId, category }` | Join battle matchmaking |
| `submit_answer` | `{ answer, timeLeft }` | Submit battle answer |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `matched` | `{ opponent, category }` | Battle match found |
| `new_round` | `{ question, round }` | New battle round |
| `round_result` | `{ correct, scores }` | Round outcome |
| `battle_end` | `{ winner, scores }` | Battle complete |
