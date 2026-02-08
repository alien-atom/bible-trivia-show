import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getQuestionsForGrid, type GridQuestion } from '@/lib/grid-game-questions';
import { useAudio } from '@/context/AudioContext';
import { Trophy, Users, Play, ArrowLeft, Crown, Star, Zap, RotateCcw, X, Check, ArrowRight, Grid3X3 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Player {
  name: string;
  score: number;
}

interface GridTile {
  column: number;
  row: number;
  points: number;
  question: GridQuestion;
  played: boolean;
}

type GamePhase = 'setup' | 'playing' | 'question' | 'steal' | 'gameover';

const GRID_CONFIG = [
  { col: 1, difficulty: 'Easy' as const, category: 'Beginner', color: 'bg-white dark:bg-slate-100', textColor: 'text-slate-800', borderColor: 'border-amber-200', hoverBg: 'hover:bg-amber-50', pointValues: [10, 20, 30, 40, 50] },
  { col: 2, difficulty: 'Easy' as const, category: 'Beginner', color: 'bg-white dark:bg-slate-100', textColor: 'text-slate-800', borderColor: 'border-amber-200', hoverBg: 'hover:bg-amber-50', pointValues: [70, 90, 110, 130, 150] },
  { col: 3, difficulty: 'Medium' as const, category: 'Intermediate', color: 'bg-blue-600', textColor: 'text-white', borderColor: 'border-blue-700', hoverBg: 'hover:bg-blue-500', pointValues: [180, 210, 240, 270, 300] },
  { col: 4, difficulty: 'Medium' as const, category: 'Intermediate', color: 'bg-blue-600', textColor: 'text-white', borderColor: 'border-blue-700', hoverBg: 'hover:bg-blue-500', pointValues: [340, 380, 420, 460, 500] },
  { col: 5, difficulty: 'Hard' as const, category: 'Expert', color: 'bg-orange-500', textColor: 'text-white', borderColor: 'border-orange-600', hoverBg: 'hover:bg-orange-400', pointValues: [550, 600, 650, 700, 750] },
  { col: 6, difficulty: 'Hard' as const, category: 'Expert', color: 'bg-orange-500', textColor: 'text-white', borderColor: 'border-orange-600', hoverBg: 'hover:bg-orange-400', pointValues: [810, 870, 930, 990, 1050] },
];

export default function GridGame() {
  const [, setLocation] = useLocation();
  const { playSound } = useAudio();

  const [phase, setPhase] = useState<GamePhase>('setup');
  const [numPlayers, setNumPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [numRounds, setNumRounds] = useState(10);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [grid, setGrid] = useState<GridTile[]>([]);
  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionsPlayed, setQuestionsPlayed] = useState(0);
  const [stealPlayerIndex, setStealPlayerIndex] = useState<number | null>(null);
  const [stealAnswer, setStealAnswer] = useState<string | null>(null);
  const [showStealAnswer, setShowStealAnswer] = useState(false);

  const initializeGrid = useCallback(() => {
    const { easy, medium, hard } = getQuestionsForGrid();
    const tiles: GridTile[] = [];

    GRID_CONFIG.forEach((config, colIdx) => {
      let questionPool: GridQuestion[];
      if (config.difficulty === 'Easy') questionPool = colIdx === 0 ? easy.slice(0, 5) : easy.slice(5, 10);
      else if (config.difficulty === 'Medium') questionPool = colIdx === 2 ? medium.slice(0, 5) : medium.slice(5, 10);
      else questionPool = colIdx === 4 ? hard.slice(0, 5) : hard.slice(5, 10);

      config.pointValues.forEach((points, rowIdx) => {
        tiles.push({
          column: config.col,
          row: rowIdx + 1,
          points,
          question: questionPool[rowIdx],
          played: false,
        });
      });
    });

    return tiles;
  }, []);

  const handleStartGame = () => {
    const validNames = playerNames.slice(0, numPlayers).map((n, i) => n.trim() || `Player ${i + 1}`);
    setPlayers(validNames.map(name => ({ name, score: 0 })));
    setGrid(initializeGrid());
    setCurrentPlayerIndex(0);
    setQuestionsPlayed(0);
    setPhase('playing');
    playSound('quizStart');
  };

  const handleTileClick = (tile: GridTile) => {
    if (tile.played) return;
    setSelectedTile(tile);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setStealPlayerIndex(null);
    setStealAnswer(null);
    setShowStealAnswer(false);
    setPhase('question');
    playSound('click');
  };

  const handleSubmitAnswer = () => {
    if (!selectedTile || !selectedAnswer) return;
    setShowAnswer(true);

    if (selectedAnswer === selectedTile.question.answer) {
      playSound('correct');
      setPlayers(prev => prev.map((p, i) =>
        i === currentPlayerIndex ? { ...p, score: p.score + selectedTile.points } : p
      ));
      setTimeout(() => {
        markTilePlayed();
        advanceTurn();
      }, 2000);
    } else {
      playSound('wrong');
      setTimeout(() => {
        setPhase('steal');
      }, 1500);
    }
  };

  const handleStealSelect = (playerIdx: number) => {
    setStealPlayerIndex(playerIdx);
    setStealAnswer(null);
    setShowStealAnswer(false);
  };

  const handleStealSubmit = () => {
    if (!selectedTile || stealPlayerIndex === null || !stealAnswer) return;
    setShowStealAnswer(true);

    if (stealAnswer === selectedTile.question.answer) {
      playSound('correct');
      setPlayers(prev => prev.map((p, i) =>
        i === stealPlayerIndex ? { ...p, score: p.score + selectedTile.points } : p
      ));
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      markTilePlayed();
      advanceTurn();
    }, 2000);
  };

  const handleSkipSteal = () => {
    markTilePlayed();
    advanceTurn();
  };

  const markTilePlayed = () => {
    if (!selectedTile) return;
    setGrid(prev => prev.map(t =>
      t.column === selectedTile.column && t.row === selectedTile.row
        ? { ...t, played: true }
        : t
    ));
    setQuestionsPlayed(prev => prev + 1);
  };

  const advanceTurn = () => {
    const newQuestionsPlayed = questionsPlayed + 1;
    const allTilesPlayed = grid.filter(t => !t.played).length <= 1;

    if (newQuestionsPlayed >= numRounds || allTilesPlayed) {
      setPhase('gameover');
      playSound('win');
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      }, 300);
    } else {
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
      setSelectedTile(null);
      setPhase('playing');
    }
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    setPlayers([]);
    setGrid([]);
    setQuestionsPlayed(0);
    setCurrentPlayerIndex(0);
  };

  const handleNumPlayersChange = (val: number) => {
    const clamped = Math.max(2, Math.min(6, val));
    setNumPlayers(clamped);
    setPlayerNames(prev => {
      const newNames = [...prev];
      while (newNames.length < clamped) newNames.push('');
      return newNames.slice(0, clamped);
    });
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            data-testid="button-back-home"
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Button>

          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">Bible Trivia Grid</span>
                </div>
                <h1 className="text-3xl font-bold" data-testid="text-grid-game-title">Bible Trivia Grid Game</h1>
                <p className="text-muted-foreground">Set up your Jeopardy-style Bible trivia showdown!</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Players</label>
                  <div className="flex items-center gap-3">
                    <Button
                      data-testid="button-decrease-players"
                      variant="outline"
                      size="sm"
                      onClick={() => handleNumPlayersChange(numPlayers - 1)}
                      disabled={numPlayers <= 2}
                    >-</Button>
                    <span className="text-2xl font-bold w-12 text-center" data-testid="text-player-count">{numPlayers}</span>
                    <Button
                      data-testid="button-increase-players"
                      variant="outline"
                      size="sm"
                      onClick={() => handleNumPlayersChange(numPlayers + 1)}
                      disabled={numPlayers >= 6}
                    >+</Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium">Player Names</label>
                  {Array.from({ length: numPlayers }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {i + 1}
                      </div>
                      <Input
                        data-testid={`input-player-name-${i}`}
                        placeholder={`Player ${i + 1}`}
                        value={playerNames[i] || ''}
                        onChange={(e) => {
                          const newNames = [...playerNames];
                          newNames[i] = e.target.value;
                          setPlayerNames(newNames);
                        }}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Rounds</label>
                  <div className="flex items-center gap-3">
                    <Button
                      data-testid="button-decrease-rounds"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumRounds(prev => Math.max(1, prev - 1))}
                      disabled={numRounds <= 1}
                    >-</Button>
                    <Input
                      data-testid="input-rounds"
                      type="number"
                      min={1}
                      max={30}
                      value={numRounds}
                      onChange={(e) => setNumRounds(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center text-2xl font-bold"
                    />
                    <Button
                      data-testid="button-increase-rounds"
                      variant="outline"
                      size="sm"
                      onClick={() => setNumRounds(prev => Math.min(30, prev + 1))}
                      disabled={numRounds >= 30}
                    >+</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Game ends after {numRounds} questions or when all tiles are cleared.</p>
                </div>
              </div>

              <Button
                data-testid="button-start-grid-game"
                className="w-full py-6 text-lg font-bold gap-2"
                onClick={handleStartGame}
              >
                <Play className="w-5 h-5" /> Start Game
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // GAME OVER PHASE
  if (phase === 'gameover') {
    const winner = sortedPlayers[0];
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <Card className="border-2 border-primary/30 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 px-8 py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
              >
                <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-winner-name">{winner.name} Wins!</h1>
              <p className="text-xl text-muted-foreground">with <span className="font-bold text-primary">{winner.score}</span> points</p>
            </div>

            <CardContent className="p-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Final Leaderboard
              </h2>
              <div className="space-y-3">
                {sortedPlayers.map((player, idx) => (
                  <motion.div
                    key={player.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                      idx === 0
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card'
                    }`}
                    data-testid={`leaderboard-player-${idx}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-primary text-primary-foreground' :
                        idx === 1 ? 'bg-slate-300 text-slate-700' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idx === 0 ? <Crown className="w-5 h-5" /> : `#${idx + 1}`}
                      </div>
                      <span className="font-semibold">{player.name}</span>
                    </div>
                    <span className="text-xl font-bold text-primary">{player.score}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button
                  data-testid="button-play-again"
                  className="flex-1 py-6 text-lg font-bold gap-2"
                  onClick={handlePlayAgain}
                >
                  <RotateCcw className="w-5 h-5" /> Play Again
                </Button>
                <Button
                  data-testid="button-go-home"
                  variant="outline"
                  className="py-6 px-6"
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // PLAYING / QUESTION / STEAL PHASES
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-primary" />
            Bible Trivia Grid
          </h1>
          <p className="text-sm text-muted-foreground">
            Round {questionsPlayed + 1} of {numRounds}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm" data-testid="text-current-player">
            Current: <span className="text-primary">{players[currentPlayerIndex]?.name}</span>
          </span>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {players.map((player, idx) => (
          <div
            key={player.name}
            className={`p-3 rounded-xl text-center border-2 transition-all ${
              idx === currentPlayerIndex
                ? 'border-primary bg-primary/10 shadow-md scale-105'
                : 'border-border bg-card'
            }`}
            data-testid={`scoreboard-player-${idx}`}
          >
            <p className="text-xs font-medium text-muted-foreground truncate">{player.name}</p>
            <p className="text-2xl font-bold text-primary">{player.score}</p>
          </div>
        ))}
      </div>

      {/* Grid Board */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Column Headers */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            {GRID_CONFIG.map(config => (
              <div
                key={config.col}
                className={`${config.color} ${config.textColor} rounded-xl p-3 text-center border ${config.borderColor}`}
              >
                <p className="font-bold text-sm">{config.category}</p>
                <p className="text-xs opacity-80">{config.difficulty}</p>
              </div>
            ))}
          </div>

          {/* Grid Tiles */}
          {[1, 2, 3, 4, 5].map(row => (
            <div key={row} className="grid grid-cols-6 gap-2 mb-2">
              {GRID_CONFIG.map(config => {
                const tile = grid.find(t => t.column === config.col && t.row === row);
                if (!tile) return <div key={config.col} />;

                return (
                  <motion.button
                    key={`${config.col}-${row}`}
                    data-testid={`tile-${config.col}-${row}`}
                    whileHover={!tile.played ? { scale: 1.05 } : {}}
                    whileTap={!tile.played ? { scale: 0.95 } : {}}
                    onClick={() => handleTileClick(tile)}
                    disabled={tile.played || phase !== 'playing'}
                    className={`relative p-4 sm:p-6 rounded-xl border-2 text-center font-bold text-lg sm:text-2xl transition-all ${
                      tile.played
                        ? 'bg-muted/50 text-muted-foreground/30 border-muted cursor-not-allowed line-through'
                        : `${config.color} ${config.textColor} ${config.borderColor} ${config.hoverBg} cursor-pointer shadow-md hover:shadow-lg`
                    }`}
                  >
                    {tile.points}
                    {tile.played && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-8 h-8 text-muted-foreground/20" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Question Modal */}
      <AnimatePresence>
        {(phase === 'question' || phase === 'steal') && selectedTile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-card border-2 border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className={`p-6 rounded-t-2xl ${
                GRID_CONFIG[selectedTile.column - 1].color
              } ${GRID_CONFIG[selectedTile.column - 1].textColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">
                      {GRID_CONFIG[selectedTile.column - 1].category}
                    </p>
                    <p className="text-3xl font-bold">{selectedTile.points} Points</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-70">{selectedTile.question.book}</p>
                    <p className="text-xs opacity-70">{selectedTile.question.verse}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {phase === 'question' && (
                  <>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {players[currentPlayerIndex]?.name}'s Turn
                      </p>
                      <h2 className="text-xl font-bold" data-testid="text-question">
                        {selectedTile.question.question}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {selectedTile.question.choices.map((choice, idx) => {
                        const isSelected = selectedAnswer === choice;
                        const isCorrect = choice === selectedTile.question.answer;
                        let btnClass = 'border-border hover:border-primary/50 hover:bg-primary/5';

                        if (showAnswer) {
                          if (isCorrect) btnClass = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                          else if (isSelected && !isCorrect) btnClass = 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                          else btnClass = 'border-border opacity-50';
                        } else if (isSelected) {
                          btnClass = 'border-primary bg-primary/10';
                        }

                        return (
                          <button
                            key={idx}
                            data-testid={`choice-${idx}`}
                            onClick={() => !showAnswer && setSelectedAnswer(choice)}
                            disabled={showAnswer}
                            className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass}`}
                          >
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-bold mr-3">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            {choice}
                          </button>
                        );
                      })}
                    </div>

                    {!showAnswer && (
                      <Button
                        data-testid="button-submit-answer"
                        className="w-full py-5 text-lg font-bold"
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                      >
                        Submit Answer
                      </Button>
                    )}

                    {showAnswer && selectedAnswer === selectedTile.question.answer && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                      >
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-green-700 dark:text-green-300">Correct! +{selectedTile.points} points</p>
                      </motion.div>
                    )}

                    {showAnswer && selectedAnswer !== selectedTile.question.answer && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                      >
                        <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="font-bold text-red-700 dark:text-red-300">Wrong answer!</p>
                        <p className="text-sm text-muted-foreground mt-1">Preparing steal opportunity...</p>
                      </motion.div>
                    )}
                  </>
                )}

                {phase === 'steal' && (
                  <>
                    <div className="text-center">
                      <Zap className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                      <h2 className="text-xl font-bold">Steal Opportunity!</h2>
                      <p className="text-muted-foreground">
                        {players[currentPlayerIndex]?.name} answered incorrectly. Choose a player to steal.
                      </p>
                    </div>

                    {stealPlayerIndex === null ? (
                      <div className="space-y-3">
                        {players.map((player, idx) => {
                          if (idx === currentPlayerIndex) return null;
                          return (
                            <Button
                              key={idx}
                              data-testid={`button-steal-player-${idx}`}
                              variant="outline"
                              className="w-full py-4 text-left justify-start gap-3"
                              onClick={() => handleStealSelect(idx)}
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                                {idx + 1}
                              </div>
                              <span className="font-semibold">{player.name}</span>
                              <span className="ml-auto text-muted-foreground">{player.score} pts</span>
                            </Button>
                          );
                        })}
                        <Button
                          data-testid="button-skip-steal"
                          variant="ghost"
                          className="w-full"
                          onClick={handleSkipSteal}
                        >
                          Skip Steal <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-bold text-primary">{players[stealPlayerIndex]?.name}</span> is attempting to steal!
                          </p>
                        </div>

                        <h3 className="text-lg font-bold text-center" data-testid="text-steal-question">
                          {selectedTile.question.question}
                        </h3>

                        <div className="space-y-3">
                          {selectedTile.question.choices.map((choice, idx) => {
                            const isSelected = stealAnswer === choice;
                            const isCorrect = choice === selectedTile.question.answer;
                            let btnClass = 'border-border hover:border-primary/50 hover:bg-primary/5';

                            if (showStealAnswer) {
                              if (isCorrect) btnClass = 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                              else if (isSelected && !isCorrect) btnClass = 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                              else btnClass = 'border-border opacity-50';
                            } else if (isSelected) {
                              btnClass = 'border-primary bg-primary/10';
                            }

                            return (
                              <button
                                key={idx}
                                data-testid={`steal-choice-${idx}`}
                                onClick={() => !showStealAnswer && setStealAnswer(choice)}
                                disabled={showStealAnswer}
                                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass}`}
                              >
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-bold mr-3">
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                {choice}
                              </button>
                            );
                          })}
                        </div>

                        {!showStealAnswer && (
                          <Button
                            data-testid="button-submit-steal"
                            className="w-full py-5 text-lg font-bold gap-2"
                            onClick={handleStealSubmit}
                            disabled={!stealAnswer}
                          >
                            <Zap className="w-5 h-5" /> Submit Steal Answer
                          </Button>
                        )}

                        {showStealAnswer && stealAnswer === selectedTile.question.answer && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                          >
                            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-700 dark:text-green-300">
                              Steal successful! {players[stealPlayerIndex]?.name} gets +{selectedTile.points} points!
                            </p>
                          </motion.div>
                        )}

                        {showStealAnswer && stealAnswer !== selectedTile.question.answer && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                          >
                            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                            <p className="font-bold text-red-700 dark:text-red-300">Steal failed!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              The correct answer was: <span className="font-semibold">{selectedTile.question.answer}</span>
                            </p>
                          </motion.div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
