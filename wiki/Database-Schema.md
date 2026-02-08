# Database Schema

The application uses PostgreSQL with Drizzle ORM. All table definitions are in `shared/schema.ts`.

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
```bash
npm run db:push
```
