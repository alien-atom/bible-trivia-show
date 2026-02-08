import { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "http";
import { storage } from "./storage";

interface Question {
  id: string;
  collection: 'Old Testament' | 'New Testament';
  book: string;
  chapter: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  choices: string[];
  answer: string;
  verse: string;
  explanation: string;
}

interface BattleRoom {
  battleId: string;
  player1: { odId: string; odName: string; socket: Socket };
  player2?: { odId: string; odName: string; socket: Socket };
  questions: Question[];
  currentRound: number;
  player1Score: number;
  player2Score: number;
  player1Answered: boolean;
  player2Answered: boolean;
  roundStartTime: number;
  categoryId: string;
  status: 'waiting' | 'active' | 'completed';
}

const waitingPlayers: Map<string, { odId: string; odName: string; socket: Socket; categoryId: string }> = new Map();
const activeBattles: Map<string, BattleRoom> = new Map();
const playerBattles: Map<string, string> = new Map();

const TIME_BONUS_MAX = 500;
const CORRECT_ANSWER_POINTS = 100;
const TOTAL_ROUNDS = 5;

// Difficulty-based timing: easy = 30s, medium = 20s, hard = 15s
function getTimeForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 30000;
    case 'medium':
      return 20000;
    case 'hard':
      return 15000;
    default:
      return 20000; // Default to medium
  }
}

let QUESTIONS: Question[] = [];

export function setQuestions(questions: Question[]) {
  QUESTIONS = questions;
}

function getRandomQuestions(count: number = 5): Question[] {
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getCorrectAnswerIndex(question: Question): number {
  return question.choices.indexOf(question.answer);
}

function calculatePoints(correct: boolean, timeMs: number, roundTimeMs: number): number {
  if (!correct) return 0;
  const timeBonus = Math.max(0, Math.floor(TIME_BONUS_MAX * (1 - timeMs / roundTimeMs)));
  return CORRECT_ANSWER_POINTS + timeBonus;
}

export function setupBattleSocket(httpServer: Server) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/socket.io"
  });

  io.on("connection", (socket: Socket) => {
    console.log("⚔️ Battle socket connected:", socket.id);

    socket.on("battle:join_queue", async (data: { odId: string; odName: string; categoryId: string }) => {
      const { odId, odName, categoryId } = data;
      
      if (playerBattles.has(odId)) {
        socket.emit("battle:error", { message: "You're already in a battle" });
        return;
      }

      const waitingKey = `${categoryId}`;
      const waitingPlayer = waitingPlayers.get(waitingKey);

      if (waitingPlayer && waitingPlayer.odId !== odId) {
        waitingPlayers.delete(waitingKey);

        const questions = getRandomQuestions(TOTAL_ROUNDS);
        const questionIds = questions.map(q => q.id);

        const battleMatch = await storage.createBattleMatch({
          categoryId,
          status: "active",
          player1Id: waitingPlayer.odId,
          player2Id: odId,
          player1Score: 0,
          player2Score: 0,
          currentRound: 0,
          totalRounds: TOTAL_ROUNDS,
          questionIds,
          startedAt: new Date()
        });

        const battleRoom: BattleRoom = {
          battleId: battleMatch.id,
          player1: { odId: waitingPlayer.odId, odName: waitingPlayer.odName, socket: waitingPlayer.socket },
          player2: { odId, odName, socket },
          questions,
          currentRound: 0,
          player1Score: 0,
          player2Score: 0,
          player1Answered: false,
          player2Answered: false,
          roundStartTime: Date.now(),
          categoryId,
          status: 'active'
        };

        activeBattles.set(battleMatch.id, battleRoom);
        playerBattles.set(waitingPlayer.odId, battleMatch.id);
        playerBattles.set(odId, battleMatch.id);

        waitingPlayer.socket.join(battleMatch.id);
        socket.join(battleMatch.id);

        io.to(battleMatch.id).emit("battle:matched", {
          battleId: battleMatch.id,
          player1: { id: waitingPlayer.odId, name: waitingPlayer.odName },
          player2: { id: odId, name: odName },
          totalRounds: TOTAL_ROUNDS
        });

        setTimeout(() => startRound(io, battleMatch.id), 3000);
      } else {
        waitingPlayers.set(waitingKey, { odId, odName, socket, categoryId });
        socket.emit("battle:queued", { message: "Waiting for opponent..." });
      }
    });

    socket.on("battle:leave_queue", (data: { odId: string }) => {
      const entries = Array.from(waitingPlayers.entries());
      for (const [key, player] of entries) {
        if (player.odId === data.odId) {
          waitingPlayers.delete(key);
          socket.emit("battle:queue_left");
          break;
        }
      }
    });

    socket.on("battle:answer", async (data: { battleId: string; odId: string; answerIndex: number }) => {
      const { battleId, odId, answerIndex } = data;
      const battle = activeBattles.get(battleId);

      if (!battle || battle.status !== 'active') {
        socket.emit("battle:error", { message: "Battle not found or inactive" });
        return;
      }

      const timeMs = Date.now() - battle.roundStartTime;
      const question = battle.questions[battle.currentRound];
      const correctIndex = getCorrectAnswerIndex(question);
      const isCorrect = answerIndex === correctIndex;
      const currentQuestion = battle.questions[battle.currentRound];
      const roundTimeMs = getTimeForDifficulty(currentQuestion?.difficulty || 'medium');
      const points = calculatePoints(isCorrect, timeMs, roundTimeMs);

      const isPlayer1 = battle.player1.odId === odId;

      if (isPlayer1 && !battle.player1Answered) {
        battle.player1Answered = true;
        battle.player1Score += points;

        await storage.updateBattleMatch(battleId, {
          player1Score: battle.player1Score
        });

        socket.emit("battle:answer_received", { correct: isCorrect, points, timeMs });
        battle.player2?.socket.emit("battle:opponent_answered");
      } else if (!isPlayer1 && !battle.player2Answered) {
        battle.player2Answered = true;
        battle.player2Score += points;

        await storage.updateBattleMatch(battleId, {
          player2Score: battle.player2Score
        });

        socket.emit("battle:answer_received", { correct: isCorrect, points, timeMs });
        battle.player1.socket.emit("battle:opponent_answered");
      }

      if (battle.player1Answered && battle.player2Answered) {
        endRound(io, battleId);
      }
    });

    socket.on("disconnect", () => {
      const waitingEntries = Array.from(waitingPlayers.entries());
      for (const [key, player] of waitingEntries) {
        if (player.socket.id === socket.id) {
          waitingPlayers.delete(key);
          break;
        }
      }

      const battleEntries = Array.from(playerBattles.entries());
      for (const [odId, battleId] of battleEntries) {
        const battle = activeBattles.get(battleId);
        if (battle && (battle.player1.socket.id === socket.id || battle.player2?.socket.id === socket.id)) {
          io.to(battleId).emit("battle:opponent_disconnected");
          endBattle(io, battleId, true);
          break;
        }
      }
    });
  });

  return io;
}

function startRound(io: SocketIOServer, battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle || battle.status !== 'active') return;

  if (battle.currentRound >= battle.questions.length) {
    endBattle(io, battleId, false);
    return;
  }

  const question = battle.questions[battle.currentRound];
  const roundTimeMs = getTimeForDifficulty(question.difficulty);
  
  battle.player1Answered = false;
  battle.player2Answered = false;
  battle.roundStartTime = Date.now();

  io.to(battleId).emit("battle:round_start", {
    round: battle.currentRound + 1,
    totalRounds: TOTAL_ROUNDS,
    question: {
      id: question.id,
      text: question.question,
      options: question.choices,
      category: question.category,
      book: question.book,
      verse: question.verse,
      difficulty: question.difficulty
    },
    timeLimit: roundTimeMs,
    player1Score: battle.player1Score,
    player2Score: battle.player2Score
  });

  setTimeout(() => {
    const currentBattle = activeBattles.get(battleId);
    if (currentBattle && currentBattle.currentRound === battle.currentRound) {
      endRound(io, battleId);
    }
  }, roundTimeMs + 1000);
}

function endRound(io: SocketIOServer, battleId: string) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  const question = battle.questions[battle.currentRound];
  const correctIndex = getCorrectAnswerIndex(question);

  io.to(battleId).emit("battle:round_end", {
    round: battle.currentRound + 1,
    correctAnswer: correctIndex,
    correctAnswerText: question.answer,
    explanation: question.explanation,
    player1Score: battle.player1Score,
    player2Score: battle.player2Score
  });

  battle.currentRound++;

  storage.updateBattleMatch(battleId, {
    currentRound: battle.currentRound
  });

  if (battle.currentRound >= TOTAL_ROUNDS) {
    setTimeout(() => endBattle(io, battleId, false), 3000);
  } else {
    setTimeout(() => startRound(io, battleId), 3000);
  }
}

async function endBattle(io: SocketIOServer, battleId: string, forfeit: boolean) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;

  battle.status = 'completed';

  let winnerId: string | null = null;
  let result: 'player1' | 'player2' | 'draw';

  if (forfeit) {
    result = battle.player1Answered ? 'player1' : 'player2';
    winnerId = result === 'player1' ? battle.player1.odId : battle.player2?.odId || null;
  } else if (battle.player1Score > battle.player2Score) {
    result = 'player1';
    winnerId = battle.player1.odId;
  } else if (battle.player2Score > battle.player1Score) {
    result = 'player2';
    winnerId = battle.player2?.odId || null;
  } else {
    result = 'draw';
  }

  await storage.updateBattleMatch(battleId, {
    status: "completed",
    winnerId,
    endedAt: new Date()
  });

  if (battle.player1.odId) {
    const stats = await storage.getUserStats(battle.player1.odId);
    if (stats) {
      await storage.updateUserStats(battle.player1.odId, {
        battlesPlayed: (stats.battlesPlayed || 0) + 1,
        battlesWon: (stats.battlesWon || 0) + (result === 'player1' ? 1 : 0),
        totalScore: stats.totalScore + battle.player1Score
      });
    }
  }

  if (battle.player2?.odId) {
    const stats = await storage.getUserStats(battle.player2.odId);
    if (stats) {
      await storage.updateUserStats(battle.player2.odId, {
        battlesPlayed: (stats.battlesPlayed || 0) + 1,
        battlesWon: (stats.battlesWon || 0) + (result === 'player2' ? 1 : 0),
        totalScore: stats.totalScore + battle.player2Score
      });
    }
  }

  io.to(battleId).emit("battle:complete", {
    result,
    forfeit,
    player1: {
      id: battle.player1.odId,
      name: battle.player1.odName,
      score: battle.player1Score,
      isWinner: result === 'player1'
    },
    player2: battle.player2 ? {
      id: battle.player2.odId,
      name: battle.player2.odName,
      score: battle.player2Score,
      isWinner: result === 'player2'
    } : null
  });

  playerBattles.delete(battle.player1.odId);
  if (battle.player2) {
    playerBattles.delete(battle.player2.odId);
  }
  activeBattles.delete(battleId);
}
