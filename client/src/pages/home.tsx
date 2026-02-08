import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/context/GameContext';
import { useAudio } from '@/context/AudioContext';
import { CATEGORIES, QUIZ_TYPES } from '@/lib/mock-data';
import { useLocation, Link } from 'wouter';
import { Scroll, Crown, Feather, Megaphone, Cross, Mail, Eye, Book, Sparkles, ArrowRight, Zap, Heart, Shield, Sprout, Star, Flame, BookOpen, Home as HomeIcon, Sword, Handshake, Map, Scale, Building, Music, Sun, Hammer, Swords, Trophy, Medal, Users, Grid3X3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import heroImage from '@assets/generated_images/playful_3d_bible_study_composition.png';
import logoImage from '/logo.png';

// Icon mapper
const IconMap: Record<string, any> = {
  Scroll, Crown, Feather, Megaphone, Cross, Mail, Eye, Zap, Heart, Shield, Sprout, Sparkles, Star, Flame, BookOpen, Home: HomeIcon, Sword, Handshake, Map, Scale, Building, Music, Sun, Hammer
};

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  totalScore: number;
}

export default function Home() {
  const { startQuiz, stats, user } = useGame();
  const [, setLocation] = useLocation();
  const { startBackgroundMusic } = useAudio();

  useEffect(() => {
    startBackgroundMusic('menu');
  }, [startBackgroundMusic]);

  const { data: topSages = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'global', 'preview'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/global');
      if (!res.ok) return [];
      const data = await res.json();
      return data.slice(0, 5);
    }
  });

  const handleStart = (categoryId: string) => {
    startQuiz(categoryId, 'standard');
    setLocation('/quiz');
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } as const }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border/20 px-8 py-16 md:px-16 md:py-24 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        {/* Background Image/Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Bible Study" 
            className="w-full h-full object-cover opacity-15 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/80 to-transparent"></div>
        </div>

        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 text-sm uppercase tracking-wide" style={{ fontFamily: '"Cinzel Decorative", serif', fontWeight: 700 }}>
              <Swords className="w-4 h-4" />
              Bible Trivia Show
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold font-display leading-[1.1] tracking-tight">
              Battle for <br/>
              <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">Biblical Wisdom.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Test your Scripture knowledge, rise through the ranks, and become a true Sage in the ultimate Bible trivia showdown.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                className="rounded-full px-8 h-14 text-lg font-bold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-lg shadow-yellow-500/25 hover:shadow-xl hover:shadow-yellow-500/40 hover:-translate-y-1 transition-all"
                onClick={() => {
                  const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
                  handleStart(randomCat);
                }}
                data-testid="button-enter-arena"
              >
                Enter the Arena
              </Button>
              <Button 
                size="lg" 
                className="rounded-full px-8 h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-1 transition-all"
                onClick={() => setLocation('/battle')}
                data-testid="button-battle-now"
              >
                <Swords className="w-5 h-5 mr-2" />
                Battle Now
              </Button>
            </div>
            
            {/* Mobile Stats Bar */}
            <div className="md:hidden grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-border/30">
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-primary" data-testid="text-quizzes-mobile">{stats?.quizzesCompleted || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Quizzes</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-yellow-600" data-testid="text-points-mobile">{stats?.totalScore || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Points</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-amber-600" data-testid="text-streak-mobile">{stats?.streak || 0}</div>
                <div className="text-xs text-muted-foreground font-medium">Streak</div>
              </div>
            </div>
          </motion.div>
          
          {/* Logo Display with Epic Animation */}
          <motion.div 
            className="hidden md:block relative z-10"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            transition={{ 
              delay: 0.2, 
              duration: 1.2, 
              type: "spring", 
              stiffness: 80,
              damping: 12
            }}
            whileHover={{ scale: 1.08, rotate: 3 }}
          >
            {/* Animated glow effect */}
            <motion.div 
              className="absolute -inset-8 bg-gradient-to-r from-yellow-400/40 via-amber-500/30 to-yellow-600/40 rounded-full blur-3xl"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.6, 0.4]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            {/* Secondary rotating glow */}
            <motion.div 
              className="absolute -inset-12 bg-gradient-to-tr from-amber-300/20 via-transparent to-yellow-500/20 rounded-full blur-2xl"
              animate={{ 
                rotate: [0, 360]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
            {/* Floating animation for logo */}
            <motion.img 
              src={logoImage} 
              alt="Bible Trivia Show" 
              className="relative w-full max-w-md drop-shadow-2xl"
              animate={{ 
                y: [0, -8, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Preview Card - Moved below hero */}
      <section className="relative -mt-8 z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Card className="rounded-[2rem] border-0 shadow-2xl bg-card/95 backdrop-blur-xl p-6 max-w-4xl mx-auto">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-display font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600">
                    <Crown className="w-6 h-6" />
                  </div>
                  Your Journey
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-muted-foreground font-medium">Quizzes Completed</span>
                  <span className="font-display font-bold text-2xl text-primary">{stats?.quizzesCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30">
                  <span className="text-muted-foreground font-medium">Daily Streak</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-2xl text-amber-600">{stats?.streak || 0}</span>
                    <span className="text-sm font-bold text-amber-400">DAYS</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/30">
                  <span className="text-muted-foreground font-medium">Total Score</span>
                  <span className="font-display font-bold text-2xl text-yellow-600">{stats?.totalScore || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
      </section>

      {/* Leaderboard Preview Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">Hall of Sages</h2>
            <p className="text-muted-foreground mt-2">The wisest biblical scholars rise to the top</p>
          </div>
          <Link href="/leaderboard">
            <Button 
              variant="outline" 
              className="gap-2 rounded-full border-2 font-bold hover:bg-primary/10"
              data-testid="button-view-leaderboard"
            >
              <Trophy className="w-4 h-4" /> View All
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-gradient-to-br from-yellow-50/50 to-amber-50/50 dark:from-yellow-950/20 dark:to-amber-950/20">
          <CardContent className="p-6">
            {topSages.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
                <p className="text-muted-foreground text-lg font-medium">No sages on the leaderboard yet!</p>
                <p className="text-sm text-muted-foreground mt-2">Be the first to claim glory by completing a quiz.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSages.map((sage, idx) => (
                  <motion.div
                    key={sage.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 border-yellow-300 dark:border-yellow-700' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600' :
                      idx === 2 ? 'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-amber-300 dark:border-amber-700' :
                      'bg-card border-border'
                    }`}
                    data-testid={`sage-preview-${sage.userId}`}
                  >
                    <div className="flex items-center justify-center w-10">
                      {idx === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                       idx === 1 ? <Medal className="w-6 h-6 text-gray-400" /> :
                       idx === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                       <span className="font-bold text-muted-foreground">#{sage.rank}</span>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-lg truncate block">{sage.displayName || 'Anonymous Sage'}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-display font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                        {sage.totalScore.toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                ))}

                <Link href="/leaderboard">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-bold cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    See all Sages on the leaderboard
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Bible Trivia Grid Game Section */}
      <section className="space-y-6">
        <Card 
          className="group border-0 shadow-xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          onClick={() => setLocation('/grid-game')}
          data-testid="card-grid-game"
        >
          <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Grid3X3 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider">Multiplayer</span>
                <span className="px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider">New Game</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Bible Trivia Grid</h2>
              <p className="text-white/80 text-lg font-medium max-w-xl">
                A Jeopardy-style Bible trivia challenge! Pick tiles, answer questions, and steal points from your opponents.
              </p>
            </div>
            <Button 
              size="lg"
              className="rounded-full h-16 px-10 text-xl font-black bg-white text-blue-700 hover:bg-white/90 shadow-xl"
              data-testid="button-play-grid-game"
            >
              Play Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Messiah's Path Featured Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-4xl font-black font-display text-foreground tracking-tight">The Messiah’s Path</h2>
            <p className="text-xl text-muted-foreground mt-2 font-medium">An epic journey through the Gospel of Matthew</p>
          </div>
          <Button 
            size="lg"
            className="rounded-full px-8 h-14 text-lg font-bold bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70"
            
            data-testid="button-start-journey"
            disabled
          >
            Start Journey <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 group relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
          <div className="relative aspect-[21/9] md:aspect-[2.4/1] overflow-hidden">
            <motion.img 
              src="/messiahs-path.jpg" 
              alt="The Messiah's Path Map" 
              className="w-full h-full object-cover"
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ 
                scale: [1.05, 1.08, 1.05],
                opacity: 1 
              }}
              transition={{ 
                scale: {
                  duration: 12,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                },
                opacity: { duration: 1 }
              }}
              whileHover={{ scale: 1.12 }}
            />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-20 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">18 Milestones</span>
                <span className="px-3 py-1 rounded-full bg-yellow-500 text-black text-xs font-black uppercase tracking-wider">Matthew Sample</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">Master the Path of the King</h3>
              <p className="text-white/80 text-lg font-medium max-w-xl hidden md:block">
                Experience the life, miracles, and teachings of Jesus as never before. Follow the golden path from the Manger to the Great Commission.
              </p>
            </div>
            <Button 
              size="lg" 
              className="rounded-full h-16 px-10 text-xl font-black bg-gray-400 dark:bg-gray-500 text-gray-600 dark:text-gray-300 cursor-not-allowed opacity-70 shadow-xl"
              disabled
              data-testid="button-play-now"
            >
              COMING SOON
            </Button>
          </div>
        </Card>
      </section>

      {/* Categories Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div>
            <h2 className="text-3xl font-bold font-display text-foreground">Explore Categories</h2>
            <p className="text-muted-foreground mt-2">Pick a topic to start testing your knowledge</p>
          </div>
          <Button 
            variant="ghost" 
            className="hidden md:flex gap-2 text-primary font-bold hover:bg-primary/10 rounded-full"
            onClick={() => {
              const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
              handleStart(randomCat);
            }}
          >
            <Zap className="w-4 h-4" /> Quick Quiz
          </Button>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {CATEGORIES.map((cat, idx) => {
            const Icon = IconMap[cat.icon] || Book;
            const isComingSoon = cat.id === 'messiahs-path';
            const colors = [
              "bg-blue-100 dark:bg-blue-900/50 text-blue-600",
              "bg-purple-100 dark:bg-purple-900/50 text-purple-600",
              "bg-pink-100 dark:bg-pink-900/50 text-pink-600",
              "bg-orange-100 dark:bg-orange-900/50 text-orange-600",
              "bg-green-100 dark:bg-green-900/50 text-green-600",
              "bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600",
              "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600"
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <motion.div key={cat.id} variants={item}>
                <Card 
                  className={`group border-0 shadow-sm transition-all duration-300 h-full flex flex-col justify-between bg-card rounded-3xl overflow-hidden ring-1 ring-border/50 ${
                    isComingSoon 
                      ? 'cursor-not-allowed opacity-75' 
                      : 'cursor-pointer hover:shadow-xl hover:-translate-y-2 hover:ring-primary/20'
                  }`}
                  onClick={() => !isComingSoon && handleStart(cat.id)}
                >
                  <CardHeader className="pb-4 relative">
                    {isComingSoon && (
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-black uppercase tracking-wider animate-pulse">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-2xl ${colorClass} flex items-center justify-center mb-4 transition-transform duration-300 ${!isComingSoon && 'group-hover:scale-110 group-hover:rotate-3'}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <CardTitle className={`font-display font-bold text-2xl ${!isComingSoon && 'group-hover:text-primary'} transition-colors`}>{cat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-medium leading-relaxed">{cat.description}</p>
                  </CardContent>
                  <CardFooter className="pt-0 mt-auto">
                    <div className={`w-full h-12 rounded-xl flex items-center justify-between px-4 transition-colors duration-300 ${
                      isComingSoon 
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' 
                        : 'bg-slate-50 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white'
                    }`}>
                      <span className="font-bold text-sm">{isComingSoon ? 'Coming Soon' : 'Start Quiz'}</span>
                      {!isComingSoon && <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}
