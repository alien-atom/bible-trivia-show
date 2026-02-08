import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/context/GameContext';
import { useAudio } from '@/context/AudioContext';
import { CATEGORIES } from '@/lib/mock-data';
import { useLocation } from 'wouter';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Clock, Zap, Crown, Shield, Flame, Users, XCircle, CheckCircle, Loader2, ArrowRight, Sparkles, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShareDialog } from '@/components/ShareDialog';

interface BattleQuestion {
  id: string;
  text: string;
  options: string[];
  category: string;
  book: string;
  verse: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface BattleState {
  status: 'idle' | 'queuing' | 'matched' | 'countdown' | 'playing' | 'round_end' | 'complete';
  battleId?: string;
  opponent?: { id: string; name: string };
  currentRound: number;
  totalRounds: number;
  myScore: number;
  opponentScore: number;
  question?: BattleQuestion;
  timeLeft: number;
  answered: boolean;
  opponentAnswered: boolean;
  lastAnswer?: { correct: boolean; points: number };
  correctAnswer?: number;
  correctAnswerText?: string;
  explanation?: string;
  result?: 'win' | 'lose' | 'draw';
}

const ROUND_TIME = 15;

export default function Battle() {
  const { user } = useGame();
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useAudio();
  const [, setLocation] = useLocation();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('genesis');
  const [shareOpen, setShareOpen] = useState(false);
  const lastTimeRef = useRef<number>(15);
  const [battleState, setBattleState] = useState<BattleState>({
    status: 'idle',
    currentRound: 0,
    totalRounds: 5,
    myScore: 0,
    opponentScore: 0,
    timeLeft: ROUND_TIME,
    answered: false,
    opponentAnswered: false
  });

  useEffect(() => {
    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Battle socket connected');
    });

    newSocket.on('battle:queued', () => {
      setBattleState(prev => ({ ...prev, status: 'queuing' }));
    });

    newSocket.on('battle:matched', (data: { battleId: string; player1: any; player2: any; totalRounds: number }) => {
      const isPlayer1 = data.player1.id === user?.id;
      const opponent = isPlayer1 ? data.player2 : data.player1;
      
      playSound('battleStart');
      startBackgroundMusic('battle');
      
      setBattleState(prev => ({
        ...prev,
        status: 'matched',
        battleId: data.battleId,
        opponent,
        totalRounds: data.totalRounds,
        currentRound: 0,
        myScore: 0,
        opponentScore: 0
      }));

      setTimeout(() => {
        setBattleState(prev => ({ ...prev, status: 'countdown' }));
      }, 1000);
    });

    newSocket.on('battle:round_start', (data: { round: number; totalRounds: number; question: BattleQuestion; timeLimit: number; player1Score: number; player2Score: number }) => {
      lastTimeRef.current = 15;
      setBattleState(prev => ({
        ...prev,
        status: 'playing',
        currentRound: data.round,
        question: data.question,
        timeLeft: Math.floor(data.timeLimit / 1000),
        answered: false,
        opponentAnswered: false,
        lastAnswer: undefined,
        correctAnswer: undefined
      }));
    });

    newSocket.on('battle:answer_received', (data: { correct: boolean; points: number; timeMs: number }) => {
      playSound(data.correct ? 'correct' : 'wrong');
      setBattleState(prev => ({
        ...prev,
        answered: true,
        lastAnswer: { correct: data.correct, points: data.points },
        myScore: prev.myScore + data.points
      }));
    });

    newSocket.on('battle:opponent_answered', () => {
      setBattleState(prev => ({ ...prev, opponentAnswered: true }));
    });

    newSocket.on('battle:round_end', (data: { round: number; correctAnswer: number; correctAnswerText: string; explanation: string; player1Score: number; player2Score: number }) => {
      setBattleState(prev => ({
        ...prev,
        status: 'round_end',
        correctAnswer: data.correctAnswer,
        correctAnswerText: data.correctAnswerText,
        explanation: data.explanation
      }));
    });

    newSocket.on('battle:complete', (data: { result: string; player1: any; player2: any; forfeit: boolean }) => {
      const isPlayer1 = data.player1.id === user?.id;
      const myData = isPlayer1 ? data.player1 : data.player2;
      const opponentData = isPlayer1 ? data.player2 : data.player1;
      
      stopBackgroundMusic();
      
      let result: 'win' | 'lose' | 'draw';
      if (myData.isWinner) {
        result = 'win';
        playSound('win');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else if (opponentData?.isWinner) {
        result = 'lose';
        playSound('lose');
      } else {
        result = 'draw';
      }

      setBattleState(prev => ({
        ...prev,
        status: 'complete',
        result,
        myScore: myData.score,
        opponentScore: opponentData?.score || 0
      }));
    });

    newSocket.on('battle:opponent_disconnected', () => {
      setBattleState(prev => ({
        ...prev,
        status: 'complete',
        result: 'win'
      }));
    });

    newSocket.on('battle:error', (data: { message: string }) => {
      console.error('Battle error:', data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (battleState.status !== 'playing') return;

    const timer = setInterval(() => {
      setBattleState(prev => {
        if (prev.timeLeft <= 5 && prev.timeLeft > 0) {
          if (prev.timeLeft !== lastTimeRef.current) {
            playSound('tick');
            lastTimeRef.current = prev.timeLeft;
          }
        }
        if (prev.timeLeft <= 1) {
          if (prev.timeLeft === 1) playSound('timeout');
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleState.status, playSound]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (battleState.status === 'playing' && battleState.timeLeft === 0 && !battleState.answered) {
      // Submit with no answer (will be scored as wrong)
      if (socket && battleState.battleId && user) {
        socket.emit('battle:answer', {
          battleId: battleState.battleId,
          odId: user.id,
          answerIndex: -1 // Invalid answer = timeout
        });
        setBattleState(prev => ({
          ...prev,
          answered: true,
          lastAnswer: { correct: false, points: 0 }
        }));
      }
    }
  }, [battleState.timeLeft, battleState.status, battleState.answered, socket, battleState.battleId, user]);

  const joinQueue = useCallback(() => {
    if (!socket || !user) return;
    
    playSound('click');
    socket.emit('battle:join_queue', {
      odId: user.id,
      odName: user.displayName || user.name || 'Anonymous Sage',
      categoryId: selectedCategory
    });
    
    setBattleState(prev => ({ ...prev, status: 'queuing' }));
  }, [socket, user, selectedCategory, playSound]);

  const leaveQueue = useCallback(() => {
    if (!socket || !user) return;
    
    socket.emit('battle:leave_queue', { odId: user.id });
    setBattleState(prev => ({ ...prev, status: 'idle' }));
  }, [socket, user]);

  const submitAnswer = useCallback((answerIndex: number) => {
    if (!socket || !battleState.battleId || !user || battleState.answered) return;

    socket.emit('battle:answer', {
      battleId: battleState.battleId,
      odId: user.id,
      answerIndex
    });
  }, [socket, battleState.battleId, battleState.answered, user]);

  const playAgain = useCallback(() => {
    setBattleState({
      status: 'idle',
      currentRound: 0,
      totalRounds: 5,
      myScore: 0,
      opponentScore: 0,
      timeLeft: ROUND_TIME,
      answered: false,
      opponentAnswered: false
    });
  }, []);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-20">
        <Swords className="w-20 h-20 mx-auto text-primary opacity-50" />
        <h2 className="text-3xl font-bold">Sign In to Battle</h2>
        <p className="text-muted-foreground">You need to be logged in to challenge other sages</p>
        <Button onClick={() => setLocation('/auth')} size="lg" className="gap-2">
          Sign In <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 text-red-700 dark:text-red-300 font-bold text-sm uppercase tracking-wide">
          <Swords className="w-4 h-4" />
          Battle Arena
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display">
          <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            Battle a Sage
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Challenge fellow believers in real-time Bible trivia battles. Speed and wisdom win!
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {battleState.status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center border-b bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Swords className="w-8 h-8 text-orange-500" />
                  Ready for Battle?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-medium text-muted-foreground">Select Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full" data-testid="battle-category-select">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/30">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm font-medium">15 Seconds</p>
                    <p className="text-xs text-muted-foreground">per question</p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                    <Zap className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm font-medium">5 Rounds</p>
                    <p className="text-xs text-muted-foreground">per battle</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Speed Bonus</p>
                    <p className="text-xs text-muted-foreground">answer faster</p>
                  </div>
                </div>

                <Button 
                  onClick={joinQueue} 
                  size="lg" 
                  className="w-full gap-2 text-lg py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  data-testid="button-find-opponent"
                >
                  <Swords className="w-5 h-5" />
                  Find Opponent
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {battleState.status === 'queuing' && (
          <motion.div
            key="queuing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardContent className="p-12 text-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <Loader2 className="w-16 h-16 mx-auto text-primary" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Searching for Opponent...</h3>
                  <p className="text-muted-foreground">Looking for a worthy challenger</p>
                </div>
                <Button variant="outline" onClick={leaveQueue} className="gap-2" data-testid="button-cancel-queue">
                  <XCircle className="w-4 h-4" />
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(battleState.status === 'matched' || battleState.status === 'countdown') && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="border-2 border-green-500/50 shadow-xl">
              <CardContent className="p-12 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <Sparkles className="w-16 h-16 mx-auto text-green-500" />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Opponent Found!</h3>
                  <p className="text-xl text-primary font-semibold">{battleState.opponent?.name}</p>
                </div>
                <p className="text-muted-foreground">Battle starting...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(battleState.status === 'playing' || battleState.status === 'round_end') && battleState.question && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center p-4 rounded-xl bg-primary/10">
                <p className="text-sm text-muted-foreground">You</p>
                <p className="text-3xl font-bold text-primary">{battleState.myScore}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm font-medium text-muted-foreground mb-1">Round {battleState.currentRound}/{battleState.totalRounds}</div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  battleState.timeLeft <= 5 ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                }`}>
                  {battleState.timeLeft}
                </div>
              </div>
              <div className="flex-1 text-center p-4 rounded-xl bg-orange-100 dark:bg-orange-950/30">
                <p className="text-sm text-muted-foreground">{battleState.opponent?.name}</p>
                <p className="text-3xl font-bold text-orange-600">{battleState.opponentScore}</p>
              </div>
            </div>

            <Card className="border-2 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{battleState.question.book}</span>
                  <span className="text-sm font-medium text-muted-foreground">{battleState.question.verse}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <p className="text-xl font-medium text-center">{battleState.question.text}</p>

                <div className="grid gap-3">
                  {battleState.question.options.map((option, index) => {
                    const isCorrect = battleState.correctAnswer === index;
                    const isSelected = battleState.answered && battleState.lastAnswer?.correct === (index === battleState.correctAnswer);
                    
                    let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all ";
                    
                    if (battleState.status === 'round_end') {
                      if (isCorrect) {
                        buttonClass += "bg-green-100 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-300";
                      } else {
                        buttonClass += "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50";
                      }
                    } else if (battleState.answered) {
                      buttonClass += "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed";
                    } else {
                      buttonClass += "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 cursor-pointer";
                    }

                    return (
                      <motion.button
                        key={index}
                        className={buttonClass}
                        onClick={() => !battleState.answered && submitAnswer(index)}
                        disabled={battleState.answered || battleState.status === 'round_end'}
                        whileHover={!battleState.answered && battleState.status !== 'round_end' ? { scale: 1.02 } : {}}
                        whileTap={!battleState.answered && battleState.status !== 'round_end' ? { scale: 0.98 } : {}}
                        data-testid={`answer-option-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-sm">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-medium">{option}</span>
                          {battleState.status === 'round_end' && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {battleState.answered && battleState.lastAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl text-center ${
                      battleState.lastAnswer.correct 
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <p className="font-bold text-lg">
                      {battleState.lastAnswer.correct ? 'Correct!' : 'Wrong!'} 
                      {battleState.lastAnswer.points > 0 && ` +${battleState.lastAnswer.points} points`}
                    </p>
                    {battleState.opponentAnswered ? (
                      <p className="text-sm mt-1">Waiting for next round...</p>
                    ) : (
                      <p className="text-sm mt-1">Waiting for opponent...</p>
                    )}
                  </motion.div>
                )}

                {battleState.status === 'round_end' && battleState.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300"
                  >
                    <p className="text-sm">{battleState.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {battleState.status === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={`border-4 shadow-2xl ${
              battleState.result === 'win' 
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30' 
                : battleState.result === 'lose'
                ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30'
                : 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30'
            }`}>
              <CardContent className="p-12 text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  {battleState.result === 'win' ? (
                    <Crown className="w-24 h-24 mx-auto text-yellow-500" />
                  ) : battleState.result === 'lose' ? (
                    <Shield className="w-24 h-24 mx-auto text-gray-400" />
                  ) : (
                    <Swords className="w-24 h-24 mx-auto text-blue-500" />
                  )}
                </motion.div>

                <div>
                  <h2 className={`text-4xl font-extrabold mb-2 ${
                    battleState.result === 'win' 
                      ? 'text-yellow-600' 
                      : battleState.result === 'lose'
                      ? 'text-gray-600'
                      : 'text-blue-600'
                  }`}>
                    {battleState.result === 'win' ? 'Victory!' : battleState.result === 'lose' ? 'Defeat' : "It's a Draw!"}
                  </h2>
                  <p className="text-muted-foreground">
                    {battleState.result === 'win' 
                      ? 'Your wisdom has prevailed!' 
                      : battleState.result === 'lose'
                      ? 'Keep studying the Word!'
                      : 'An evenly matched battle!'}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                    <p className="text-4xl font-bold text-primary">{battleState.myScore}</p>
                  </div>
                  <div className="text-2xl text-muted-foreground">vs</div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">{battleState.opponent?.name}</p>
                    <p className="text-4xl font-bold text-orange-600">{battleState.opponentScore}</p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={playAgain}
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    data-testid="button-play-again"
                  >
                    <Swords className="w-5 h-5" />
                    Battle Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShareOpen(true)}
                    size="lg"
                    data-testid="button-share-battle"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setLocation('/')}
                    size="lg"
                    data-testid="button-go-home"
                  >
                    Home
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ShareDialog
              open={shareOpen}
              onOpenChange={setShareOpen}
              score={battleState.myScore}
              totalQuestions={battleState.totalRounds}
              percentage={Math.round((battleState.myScore / ((battleState.myScore + battleState.opponentScore) || 1)) * 100)}
              gameMode="battle"
              extraInfo={battleState.result === 'win' ? 'won' : battleState.result === 'lose' ? 'fought hard' : 'tied'}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
