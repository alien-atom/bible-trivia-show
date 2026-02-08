import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Lightbulb, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Quiz() {
  const { currentQuiz, submitAnswer, nextQuestion, endQuiz, markExpired } = useGame();
  const { playSound, startBackgroundMusic, stopBackgroundMusic } = useAudio();
  const [, setLocation] = useLocation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const lastTimeRef = useRef<number>(30);
  const hasPlayedTickRef = useRef(false);
  
  // Local UI state derived from context
  const hasSubmitted = currentQuiz?.questionState === 'answered' || currentQuiz?.questionState === 'expired';
  
  // Start quiz music
  useEffect(() => {
    startBackgroundMusic('quiz');
    playSound('quizStart');
    return () => stopBackgroundMusic();
  }, []);
  
  // Play tick sounds when time is running low
  useEffect(() => {
    if (currentQuiz?.timeRemaining !== undefined && currentQuiz?.questionState === 'active') {
      if (currentQuiz.timeRemaining <= 5 && currentQuiz.timeRemaining > 0) {
        if (currentQuiz.timeRemaining !== lastTimeRef.current) {
          playSound('tick');
          lastTimeRef.current = currentQuiz.timeRemaining;
        }
      }
      if (currentQuiz.timeRemaining === 0 && !hasPlayedTickRef.current) {
        playSound('timeout');
        hasPlayedTickRef.current = true;
      }
    }
    if (currentQuiz?.questionState !== 'active') {
      hasPlayedTickRef.current = false;
    }
  }, [currentQuiz?.timeRemaining, currentQuiz?.questionState, playSound]);
  
  // Redirect if no quiz is active
  useEffect(() => {
    if (!currentQuiz) {
      setLocation('/');
    }
  }, [currentQuiz, setLocation]);

  // Handle completion redirect
  useEffect(() => {
    if (currentQuiz?.isComplete) {
      setLocation('/results');
    }
  }, [currentQuiz?.isComplete, setLocation]);
  
  // Reset local selection and tick tracking on new question
  useEffect(() => {
    setSelectedOption(null);
    lastTimeRef.current = 30;
    hasPlayedTickRef.current = false;
  }, [currentQuiz?.currentIndex]);

  // Auto-submit selected answer when time runs out, or mark as expired if no selection
  useEffect(() => {
    if (currentQuiz?.timeRemaining === 0 && currentQuiz?.questionState === 'active') {
      if (selectedOption) {
        // Auto-submit the selected answer before it expires
        submitAnswer(selectedOption);
      } else {
        // No selection - mark as expired (wrong answer)
        markExpired();
      }
    }
  }, [currentQuiz?.timeRemaining, currentQuiz?.questionState, selectedOption, submitAnswer, markExpired]);

  if (!currentQuiz || currentQuiz.isComplete) return null;

  const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
  const progress = ((currentQuiz.currentIndex) / currentQuiz.questions.length) * 100;
  
  const isExpired = currentQuiz.questionState === 'expired';
  const isCorrect = currentQuiz.answers.find(a => a.questionId === currentQuestion.id)?.isCorrect || false;

  // Timer format
  const isLowTime = currentQuiz.timeRemaining < 5;
  const timerColor = isLowTime ? "text-red-600 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800" : "text-muted-foreground bg-white dark:bg-gray-800 border-border";

  const handleOptionSelect = (option: string) => {
    if (hasSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    const isCorrect = submitAnswer(selectedOption);
    playSound(isCorrect ? 'correct' : 'wrong');
  };

  const handleNext = () => {
    playSound('click');
    nextQuestion();
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="mb-8 space-y-3">
        <div className="flex justify-between items-center text-sm font-bold text-muted-foreground uppercase tracking-wide">
          <div className="flex items-center gap-3">
             <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm border">Question {currentQuiz.currentIndex + 1} / {currentQuiz.questions.length}</span>
             <span className={cn(
               "flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm border transition-all duration-300 min-w-[80px] justify-center",
               timerColor,
               isLowTime && "animate-pulse scale-105"
             )}>
               <Clock className="w-4 h-4" />
               {currentQuiz.timeRemaining}s
             </span>
          </div>
          <span className="text-primary bg-primary/10 px-3 py-1 rounded-full">Score: {currentQuiz.score}</span>
        </div>
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
           <motion.div 
             className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full"
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.5, ease: "easeOut" }}
           />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        >
          <Card className={cn(
            "border-0 shadow-2xl bg-card rounded-[2rem] overflow-hidden ring-1 transition-all duration-500",
             isExpired ? "ring-red-200 shadow-red-100" : "ring-border/50"
          )}>
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-8 pt-10 px-8 md:px-12 border-b border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
                  <BookOpen className="w-3 h-3" />
                  {currentQuestion.category}
                </div>
                {isExpired && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider animate-bounce">
                    <AlertCircle className="w-3 h-3" />
                    Time's Up!
                  </div>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight text-foreground">
                {currentQuestion.question}
              </h2>
            </CardHeader>

            <CardContent className="pt-8 px-8 md:px-12 space-y-6">
              <div className="grid gap-4">
                {currentQuestion.choices.map((option, idx) => {
                  let stateStyle = "hover:bg-slate-50 hover:border-primary/50 hover:shadow-md";
                  let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-200 mr-3" />;
                  
                  if (selectedOption === option) {
                    stateStyle = "border-primary bg-primary/5 ring-2 ring-primary shadow-lg shadow-primary/10";
                    icon = <div className="w-6 h-6 rounded-full border-4 border-primary mr-3" />;
                  }
                  
                  if (hasSubmitted) {
                    if (option === currentQuestion.answer) {
                      stateStyle = "border-green-500 bg-green-50 dark:bg-green-950/50 text-green-900 dark:text-green-100 ring-2 ring-green-500 shadow-green-200 dark:shadow-green-900/20";
                      icon = <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />;
                    } else if (selectedOption === option && option !== currentQuestion.answer) {
                      stateStyle = "border-red-500 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-100 ring-2 ring-red-500";
                      icon = <XCircle className="w-6 h-6 text-red-500 dark:text-red-400 mr-3" />;
                    } else {
                      stateStyle = "opacity-40 grayscale";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                      whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                      onClick={() => handleOptionSelect(option)}
                      disabled={hasSubmitted}
                      className={cn(
                        "w-full text-left p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-700 transition-all duration-200 font-medium text-lg flex items-center",
                        "bg-white dark:bg-gray-800 shadow-sm",
                        stateStyle
                      )}
                    >
                      {icon}
                      <span className="flex-1">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback Section */}
              <AnimatePresence mode="wait">
                {hasSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "rounded-2xl p-6 mt-6 border-2 overflow-hidden",
                      isCorrect ? "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" : "bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800"
                    )}
                  >
                    <div className="flex gap-4 items-start">
                      <div className={cn("p-2 rounded-full", isCorrect ? "bg-green-200 text-green-700" : "bg-orange-200 text-orange-700")}>
                        {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : (isExpired ? <Clock className="w-6 h-6" /> : <Lightbulb className="w-6 h-6" />)}
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-display font-bold text-lg mb-1", isCorrect ? "text-green-800 dark:text-green-200" : "text-orange-800 dark:text-orange-200")}>
                          {isExpired ? "Time's Up!" : (isCorrect ? 'Correct! Amazing job.' : 'Not quite right.')}
                        </p>
                        <p className="text-base text-foreground/80 leading-relaxed">{currentQuestion.explanation}</p>
                        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-black/5 dark:border-white/10 text-xs font-mono font-bold uppercase tracking-wide">
                          <BookOpen className="w-3 h-3 mr-2" />
                          {currentQuestion.verse}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>

            <CardFooter className="bg-slate-50 dark:bg-slate-800/50 p-6 md:px-12 flex justify-end">
              {!hasSubmitted ? (
                <Button 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={!selectedOption}
                  className="w-full md:w-auto h-14 rounded-full px-8 text-lg font-bold shadow-lg shadow-primary/20"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={handleNext}
                  className="w-full md:w-auto h-14 rounded-full px-8 text-lg font-bold gap-2 animate-pulse hover:animate-none shadow-lg shadow-primary/20"
                >
                  {currentQuiz.currentIndex >= currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
