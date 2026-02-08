import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useGame } from '@/context/GameContext';
import { useAudio } from '@/context/AudioContext';
import { User, LogOut, Trophy, Settings, Sun, Moon, Swords, Volume2, VolumeX, Grid3X3 } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileSettings } from '@/components/ProfileSettings';
import logoImage from '/logo.png';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoadingUser } = useGame();
  const { isMusicEnabled, isSfxEnabled, toggleMusic, toggleSfx, startBackgroundMusic, playSound } = useAudio();
  const [location] = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  
  // Start menu music on home page
  useEffect(() => {
    if (location === '/') {
      startBackgroundMusic('menu');
    }
  }, [location, startBackgroundMusic]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground bg-grid-pattern relative">
      {/* Decorative gradient blob */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-amber-200/60 bg-[#F5F0E6] dark:bg-[#F5F0E6] backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src={logoImage} 
              alt="Bible Trivia Show" 
              className="h-14 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          <nav className="flex items-center gap-1 sm:gap-3 [&_button]:text-slate-800 [&_svg]:text-slate-700">
            <Link href="/grid-game">
              <Button 
                data-testid="button-grid-game-nav" 
                variant={location === '/grid-game' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1.5 rounded-full px-2 sm:px-3 sm:gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
            </Link>

            <Link href="/battle">
              <Button 
                data-testid="button-battle" 
                variant={location === '/battle' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1.5 rounded-full px-2 sm:px-3 sm:gap-2"
              >
                <Swords className="w-4 h-4" />
                <span className="hidden sm:inline">Battle</span>
              </Button>
            </Link>

            <Link href="/leaderboard">
              <Button 
                data-testid="button-leaderboard" 
                variant={location === '/leaderboard' ? 'secondary' : 'ghost'} 
                size="sm" 
                className="gap-1.5 rounded-full px-2 sm:px-3 sm:gap-2"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Button>
            </Link>

            <Button
              data-testid="button-audio-toggle"
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0"
              onClick={() => {
                toggleMusic();
                toggleSfx();
              }}
              title={isMusicEnabled ? "Mute audio" : "Unmute audio"}
            >
              {isMusicEnabled || isSfxEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="sr-only">Toggle audio</span>
            </Button>

            <Button
              data-testid="button-theme-toggle"
              variant="ghost"
              size="sm"
              className="rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {!isLoadingUser && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button data-testid="button-user-menu" variant="ghost" className="gap-2 font-medium rounded-full px-4 hover:bg-primary/10 hover:text-primary">
                      <User className="w-5 h-5" />
                      {user.name || user.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl min-w-[180px]">
                    <DropdownMenuItem 
                      data-testid="button-profile" 
                      onClick={() => setProfileOpen(true)} 
                      className="cursor-pointer font-medium rounded-lg m-1"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem data-testid="button-logout" onClick={logout} className="text-destructive cursor-pointer font-medium focus:bg-destructive/10 focus:text-destructive rounded-lg m-1">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                location !== '/auth' && (
                  <Link href="/auth">
                    <Button data-testid="button-signin" variant="default" size="sm" className="rounded-full px-6 font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
                      Sign In
                    </Button>
                  </Link>
                )
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 relative z-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Bible Trivia Show</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="mailto:hello@bibletriviashow.com" className="hover:text-primary transition-colors flex items-center gap-1">
              <span>hello@bibletriviashow.com</span>
            </a>
          </div>
        </div>
      </footer>

      <ProfileSettings 
        open={profileOpen} 
        onOpenChange={setProfileOpen} 
        currentUser={user}
      />
    </div>
  );
}
