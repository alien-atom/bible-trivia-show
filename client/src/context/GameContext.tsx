import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Question, QUESTIONS, CATEGORIES } from '@/lib/mock-data';
import MESSIAHS_PATH_QUESTIONS from '@/lib/messiahs-path-questions';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { UserStats } from '@shared/schema';

const ALL_QUESTIONS = [...QUESTIONS, ...MESSIAHS_PATH_QUESTIONS];

interface User {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  territoryId: string | null;
}

interface GameContextType {
  user: User | null;
  stats: UserStats | null;
  isLoadingUser: boolean;
  currentQuiz: {
    categoryId: string;
    questions: Question[];
    currentIndex: number;
    score: number;
    answers: { questionId: string; isCorrect: boolean }[];
    isComplete: boolean;
    timeRemaining: number;
    questionState: 'active' | 'answered' | 'expired';
    startTime: number;
  } | null;
  setUser: (user: User | null) => void;
  refreshStats: () => Promise<void>;
  logout: () => Promise<void>;
  startQuiz: (categoryId: string, typeId: string) => void;
  submitAnswer: (answer: string) => boolean | undefined;
  nextQuestion: () => void;
  endQuiz: () => Promise<void>;
  markExpired: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Difficulty-based timing: easy = 30s, medium = 20s, hard = 15s
function getTimeForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy':
      return 30;
    case 'medium':
      return 20;
    case 'hard':
      return 15;
    default:
      return 20; // Default to medium
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<GameContextType['currentQuiz']>(null);
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await api.getMe();
        if (userData) {
          setUser(userData);
          const statsData = await api.getStats();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    checkAuth();
  }, []);

  // Refresh stats
  const refreshStats = async () => {
    if (!user) return;
    try {
      const statsData = await api.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      setStats(null);
      setCurrentQuiz(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Timer Logic - only decrement, let quiz page handle expiration
  useEffect(() => {
    if (currentQuiz && !currentQuiz.isComplete && currentQuiz.questionState === 'active' && currentQuiz.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setCurrentQuiz(prev => {
          if (!prev) return null;
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentQuiz?.timeRemaining, currentQuiz?.isComplete, currentQuiz?.questionState]);

  // Mark question as expired after timer hits zero (only if not already answered)
  const markExpired = () => {
    setCurrentQuiz(prev => {
      if (!prev || prev.questionState !== 'active') return prev;
      const currentQuestion = prev.questions[prev.currentIndex];
      // Check if answer already exists for this question
      const alreadyAnswered = prev.answers.some(a => a.questionId === currentQuestion.id);
      if (alreadyAnswered) {
        return { ...prev, questionState: 'expired' };
      }
      return {
        ...prev,
        questionState: 'expired',
        answers: [...prev.answers, { questionId: currentQuestion.id, isCorrect: false }]
      };
    });
  };

  const startQuiz = (categoryId: string, _typeId: string) => {
    // Find the category to get the book name for filtering
    const category = CATEGORIES.find(c => c.id === categoryId);
    const bookName = category?.title || '';
    
    // Filter questions by book name or category (matching to our category structure)
    let categoryQuestions = ALL_QUESTIONS.filter(q => {
      // Special handling for Messiah's Path - match by category (normalize apostrophes)
      if (categoryId === 'messiahs-path') {
        const normalizedCategory = q.category.toLowerCase().replace(/['']/g, "'");
        return normalizedCategory === "the messiah's path";
      }
      // Regular categories - match by book
      return q.book.toLowerCase().replace(/\s+/g, '-') === categoryId.toLowerCase() ||
             q.book === bookName;
    });
    
    const seenIds = new Set(stats?.seenQuestionIds || []);
    const unseenQuestions = categoryQuestions.filter(q => !seenIds.has(q.id));
    const seenQuestions = categoryQuestions.filter(q => seenIds.has(q.id));
    
    let questionsPool = [
      ...unseenQuestions.sort(() => 0.5 - Math.random()), 
      ...seenQuestions.sort(() => 0.5 - Math.random())
    ];
    
    if (questionsPool.length < 10) {
       // Get questions from the same collection first, then others
       const collection = category?.collection;
       const otherQuestions = ALL_QUESTIONS.filter(q => 
         q.book.toLowerCase().replace(/\s+/g, '-') !== categoryId.toLowerCase() &&
         q.book !== bookName
       );
       const sameCollection = otherQuestions.filter(q => q.collection === collection);
       const differentCollection = otherQuestions.filter(q => q.collection !== collection);
       
       const unseenOthers = [...sameCollection, ...differentCollection].filter(q => !seenIds.has(q.id)).sort(() => 0.5 - Math.random());
       const seenOthers = [...sameCollection, ...differentCollection].filter(q => seenIds.has(q.id)).sort(() => 0.5 - Math.random());
       
       const needed = 10 - questionsPool.length;
       const extras = [...unseenOthers, ...seenOthers].slice(0, needed);
       questionsPool = [...questionsPool, ...extras];
    }
    
    const finalQuestions = questionsPool.slice(0, 10);
    
    const firstQuestion = finalQuestions[0];
    const initialTime = getTimeForDifficulty(firstQuestion?.difficulty || 'medium');
    
    setCurrentQuiz({
      categoryId,
      questions: finalQuestions,
      currentIndex: 0,
      score: 0,
      answers: [],
      isComplete: false,
      timeRemaining: initialTime,
      questionState: 'active',
      startTime: Date.now()
    });
  };

  const submitAnswer = (selectedAnswer: string) => {
    if (!currentQuiz || currentQuiz.questionState !== 'active') return undefined;

    const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    
    setCurrentQuiz(prev => {
      if (!prev) return null;
      return {
        ...prev,
        score: isCorrect ? prev.score + 10 : prev.score,
        answers: [...prev.answers, { questionId: currentQuestion.id, isCorrect }],
        questionState: 'answered'
      };
    });

    // Update seen questions in backend
    if (stats && !stats.seenQuestionIds.includes(currentQuestion.id)) {
      const newSeenIds = [...stats.seenQuestionIds, currentQuestion.id];
      api.updateStats({ seenQuestionIds: newSeenIds })
        .then(() => refreshStats())
        .catch(err => console.error('Failed to update seen questions:', err));
    }

    return isCorrect;
  };

  const nextQuestion = () => {
    if (!currentQuiz) return;
    
    if (currentQuiz.currentIndex >= currentQuiz.questions.length - 1) {
      endQuiz();
    } else {
      setCurrentQuiz(prev => {
        if (!prev) return null;
        const nextQuestion = prev.questions[prev.currentIndex + 1];
        const nextTime = getTimeForDifficulty(nextQuestion?.difficulty || 'medium');
        return { 
          ...prev, 
          currentIndex: prev.currentIndex + 1,
          timeRemaining: nextTime,
          questionState: 'active'
        };
      });
    }
  };

  const endQuiz = async () => {
    if (!currentQuiz) return;
    
    const finalScore = currentQuiz.score;
    const correctAnswers = currentQuiz.answers.filter(a => a.isCorrect).length;
    const allCorrect = currentQuiz.answers.every(a => a.isCorrect);
    const timeTaken = Math.floor((Date.now() - currentQuiz.startTime) / 1000);

    setCurrentQuiz(prev => prev ? { ...prev, isComplete: true } : null);
    
    // Only save to backend if user is logged in with stats
    if (stats && user) {
      try {
        // Calculate new streak
        const lastQuizDate = stats.lastQuizDate ? new Date(stats.lastQuizDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newStreak = stats.streak;
        if (lastQuizDate) {
          const lastDate = new Date(lastQuizDate);
          lastDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            newStreak += 1;
          } else if (daysDiff > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        // Update badges
        const newBadges = [...stats.badges];
        if (stats.quizzesCompleted === 0 && !newBadges.includes('First Step')) {
          newBadges.push('First Step');
          toast({ title: "New Badge Unlocked!", description: "First Step: Completed your first quiz." });
        }
        if (allCorrect && !newBadges.includes('Scripture Scholar')) {
          newBadges.push('Scripture Scholar');
          toast({ title: "New Badge Unlocked!", description: "Scripture Scholar: Perfect score!" });
        }

        // Update stats
        await api.updateStats({
          totalScore: stats.totalScore + finalScore,
          quizzesCompleted: stats.quizzesCompleted + 1,
          streak: newStreak,
          badges: newBadges,
          lastQuizDate: new Date()
        });

        // Save quiz session
        await api.saveQuizSession({
          categoryId: currentQuiz.categoryId,
          score: finalScore,
          totalQuestions: currentQuiz.questions.length,
          correctAnswers,
          timeTaken
        });

        // Refresh stats
        await refreshStats();
      } catch (error) {
        console.error('Failed to save quiz results:', error);
        toast({ 
          title: "Error", 
          description: "Failed to save your quiz results. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <GameContext.Provider value={{ 
      user, 
      stats, 
      isLoadingUser,
      currentQuiz, 
      setUser,
      refreshStats,
      logout, 
      startQuiz, 
      submitAnswer, 
      nextQuestion, 
      endQuiz,
      markExpired
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
