import { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Trophy, Home, RefreshCw, Share2, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ShareDialog } from '@/components/ShareDialog';

export default function Results() {
  const { currentQuiz, stats } = useGame();
  const { playSound, stopBackgroundMusic } = useAudio();
  const [, setLocation] = useLocation();
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    // If no quiz data, go home
    if (!currentQuiz) {
      setLocation('/');
      return;
    }
    
    // Stop any playing music and play win/lose sound
    stopBackgroundMusic();
    const percentage = Math.round((currentQuiz.score / (currentQuiz.questions.length * 10)) * 100);
    playSound(percentage >= 60 ? 'win' : 'lose');
    
    // Confetti on mount!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FBBF24', '#F59E0B', '#EAB308', '#FCD34D']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FBBF24', '#F59E0B', '#EAB308', '#FCD34D']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

  }, [currentQuiz, setLocation]);

  if (!currentQuiz) return null;

  const percentage = Math.round((currentQuiz.score / (currentQuiz.questions.length * 10)) * 100);
  
  let message = "Good effort!";
  let subMessage = "Keep practicing to grow stronger.";
  let bgGradient = "from-amber-500 to-yellow-600";
  
  if (percentage === 100) {
    message = "Perfect Score! Amazing!";
    subMessage = "You're a Scripture Scholar!";
    bgGradient = "from-yellow-400 to-amber-500";
  } else if (percentage >= 80) {
    message = "Excellent work!";
    subMessage = "You really know your Bible.";
    bgGradient = "from-yellow-500 to-amber-600";
  } else if (percentage >= 60) {
    message = "Well done!";
    subMessage = "You're getting better every day.";
    bgGradient = "from-amber-400 to-yellow-500";
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl overflow-hidden relative rounded-[2.5rem]">
          {/* Header Background */}
          <div className={`absolute top-0 left-0 w-full h-48 bg-gradient-to-br ${bgGradient}`} />
          
          <CardHeader className="pt-16 pb-2 relative z-10">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-white/30"
            >
              <Trophy className={`w-16 h-16 text-yellow-500 fill-yellow-500 drop-shadow-md`} />
            </motion.div>
            <CardTitle className="font-display text-4xl font-bold text-foreground mt-4">{message}</CardTitle>
            <p className="text-muted-foreground text-lg">{subMessage}</p>
          </CardHeader>
          
          <CardContent className="space-y-8 px-8 pb-8 pt-4">
            <div className="flex justify-center items-center gap-2">
               {[1,2,3].map(i => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.5 + (i * 0.2) }}
                 >
                   <Star className={`w-8 h-8 ${percentage > 30 * i ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                 </motion.div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="text-4xl font-black text-primary mb-1" data-testid="text-quiz-points">+{currentQuiz.score}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Points Earned</div>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="text-4xl font-black text-accent mb-1" data-testid="text-quiz-accuracy">{percentage}%</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Accuracy</div>
              </div>
            </div>

            {stats && (
              <div className="p-4 rounded-3xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-700">
                <div className="text-3xl font-black text-yellow-600 mb-1" data-testid="text-total-score">{stats.totalScore.toLocaleString()}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Total Score</div>
              </div>
            )}

            {/* Questions Review List - Brief */}
            <div className="text-left space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
               <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Quiz Review</h4>
               {currentQuiz.answers.map((ans, idx) => (
                 <div key={idx} className="flex items-center gap-3 text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${ans.isCorrect ? "bg-green-100 dark:bg-green-900/50 text-green-600" : "bg-red-100 dark:bg-red-900/50 text-red-600"}`}>
                      {ans.isCorrect ? "✓" : "✕"}
                    </div>
                    <span className="truncate flex-1 font-medium text-foreground/80">Question {idx + 1}</span>
                 </div>
               ))}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-10 px-8">
             <Button className="w-full h-14 rounded-full text-lg font-bold shadow-lg shadow-primary/25 hover:-translate-y-1 transition-transform" size="lg" onClick={() => setLocation('/')}>
               <RefreshCw className="w-5 h-5 mr-2" />
               Play Again
             </Button>
             <div className="flex gap-4 w-full">
               <Button variant="outline" className="flex-1 h-12 rounded-full font-semibold border-2" onClick={() => setLocation('/')}>
                 <Home className="w-4 h-4 mr-2" />
                 Home
               </Button>
               <Button 
                 variant="outline" 
                 className="flex-1 h-12 rounded-full font-semibold border-2" 
                 onClick={() => setShareOpen(true)}
                 data-testid="button-share-results"
               >
                 <Share2 className="w-4 h-4 mr-2" />
                 Share
               </Button>
             </div>
          </CardFooter>
        </Card>
      </motion.div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        score={currentQuiz.score}
        totalQuestions={currentQuiz.questions.length}
        percentage={percentage}
        category={currentQuiz.categoryId}
      />
    </div>
  );
}
