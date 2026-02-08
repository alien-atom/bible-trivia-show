import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { GameProvider } from "@/context/GameContext";
import { AudioProvider } from "@/context/AudioContext";
import { Layout } from "@/components/layout/Layout";
import Home from "@/pages/home";
import Quiz from "@/pages/quiz";
import Results from "@/pages/results";
import Auth from "@/pages/auth";
import Leaderboard from "@/pages/leaderboard";
import Battle from "@/pages/battle";
import GridGame from "@/pages/grid-game";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/quiz" component={Quiz} />
        <Route path="/results" component={Results} />
        <Route path="/auth" component={Auth} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/battle" component={Battle} />
        <Route path="/grid-game" component={GridGame} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <GameProvider>
            <Router />
            <Toaster />
          </GameProvider>
        </AudioProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
