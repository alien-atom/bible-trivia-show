# Game Modes

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
