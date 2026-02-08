import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/context/GameContext';
import { Crown, Flame, Globe, Medal, Shield, Swords, Trophy, MapPin, Zap, TrendingUp, Flag, Users, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  countryId: string | null;
  countryName: string | null;
  flagEmoji: string | null;
  territoryId: string | null;
  territoryName: string | null;
  totalScore: number;
  quizzesCompleted: number;
  battlesWon: number;
  streak: number;
}

interface Territory {
  id: string;
  name: string;
  region: string;
  emblemColor: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
  territoryId: string;
  flagEmoji: string | null;
}

interface TerritoryRanking {
  rank: number;
  territoryId: string;
  territoryName: string;
  emblemColor: string;
  totalScore: number;
  playerCount: number;
  avgScore: number;
}

interface CountryRanking {
  rank: number;
  countryId: string;
  countryName: string;
  flagEmoji: string | null;
  territoryId: string;
  territoryName: string;
  totalScore: number;
  playerCount: number;
  avgScore: number;
}

export default function Leaderboard() {
  const { user } = useGame();
  const [selectedTerritory, setSelectedTerritory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const { data: territories = [] } = useQuery<Territory[]>({
    queryKey: ['territories'],
    queryFn: async () => {
      const res = await fetch('/api/territories');
      if (!res.ok) throw new Error('Failed to fetch territories');
      return res.json();
    }
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetch('/api/countries');
      if (!res.ok) throw new Error('Failed to fetch countries');
      return res.json();
    }
  });

  const { data: territoryRankings = [], isLoading: territoryRankingsLoading } = useQuery<TerritoryRanking[]>({
    queryKey: ['leaderboard', 'territories'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/territories');
      if (!res.ok) throw new Error('Failed to fetch territory rankings');
      return res.json();
    }
  });

  const { data: countryRankings = [], isLoading: countryRankingsLoading } = useQuery<CountryRanking[]>({
    queryKey: ['leaderboard', 'countries'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/countries');
      if (!res.ok) throw new Error('Failed to fetch country rankings');
      return res.json();
    }
  });

  const { data: globalLeaderboard = [], isLoading: globalLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'global'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/global');
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    }
  });

  const { data: territoryLeaderboard = [], isLoading: territoryLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'territory', selectedTerritory],
    queryFn: async () => {
      if (selectedTerritory === 'all') return [];
      const res = await fetch(`/api/leaderboard/territory/${selectedTerritory}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    enabled: selectedTerritory !== 'all'
  });

  const { data: countryLeaderboard = [], isLoading: countryLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'country', selectedCountry],
    queryFn: async () => {
      if (selectedCountry === 'all') return [];
      const res = await fetch(`/api/leaderboard/country/${selectedCountry}`);
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    enabled: selectedCountry !== 'all'
  });

  const { data: myRank } = useQuery<LeaderboardEntry | null>({
    queryKey: ['leaderboard', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/leaderboard/me');
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="font-bold text-muted-foreground w-6 text-center">#{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 border-yellow-200 dark:border-yellow-700';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-600';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-200 dark:border-amber-700';
    return 'bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const renderLeaderboard = (entries: LeaderboardEntry[], loading: boolean) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (entries.length === 0) {
      return (
        <div className="text-center py-20 text-muted-foreground">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No sages yet. Be the first to claim glory!</p>
        </div>
      );
    }

    return (
      <motion.div 
        className="space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {entries.map((entry) => (
          <motion.div
            key={entry.userId}
            variants={item}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] ${getRankStyle(entry.rank)} ${user?.id === entry.userId ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            data-testid={`leaderboard-entry-${entry.userId}`}
          >
            <div className="flex items-center justify-center w-10">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {entry.flagEmoji && <span className="text-xl">{entry.flagEmoji}</span>}
                <span className="font-bold text-lg truncate" data-testid={`name-${entry.userId}`}>
                  {entry.displayName || 'Anonymous Sage'}
                </span>
                {user?.id === entry.userId && (
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">YOU</span>
                )}
              </div>
              {(entry.countryName || entry.territoryName) && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{entry.countryName || entry.territoryName}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 text-right">
              <div className="hidden sm:block">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{entry.streak}</span>
                </div>
                <span className="text-xs text-muted-foreground">streak</span>
              </div>
              
              <div className="hidden sm:block">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Swords className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">{entry.battlesWon || 0}</span>
                </div>
                <span className="text-xs text-muted-foreground">battles</span>
              </div>

              <div className="min-w-[80px]">
                <div className="flex items-center justify-end gap-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-display font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent" data-testid={`score-${entry.userId}`}>
                    {entry.totalScore.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground text-right block">points</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/50 dark:to-amber-900/50 text-yellow-700 dark:text-yellow-300 font-bold text-sm uppercase tracking-wide">
          <Swords className="w-4 h-4" />
          Hall of Sages
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold font-display">
          <span className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Leaderboard
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          The greatest Biblical scholars rise to the top. Will your name be etched among the legends?
        </p>
      </motion.div>

      {myRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-yellow-50 dark:to-yellow-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-yellow-500/30">
                    #{myRank.rank}
                  </div>
                  <div>
                    <p className="font-bold text-lg" data-testid="my-rank-name">{myRank.displayName || 'Anonymous Sage'}</p>
                    <p className="text-muted-foreground text-sm">Your current ranking</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Flame className="w-5 h-5" />
                      <span className="font-bold text-xl">{myRank.streak}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">streak</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-primary">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-bold text-xl" data-testid="my-rank-score">{myRank.totalScore.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">points</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Tabs defaultValue="global" className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="global" className="gap-2" data-testid="tab-global">
              <Globe className="w-4 h-4" />
              Global
            </TabsTrigger>
            <TabsTrigger value="territory" className="gap-2" data-testid="tab-territory">
              <Map className="w-4 h-4" />
              Territory
            </TabsTrigger>
            <TabsTrigger value="country" className="gap-2" data-testid="tab-country">
              <Flag className="w-4 h-4" />
              Country
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="global">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Globe className="w-6 h-6 text-blue-500" />
                Global Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderLeaderboard(globalLeaderboard, globalLoading)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="territory">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Map className="w-6 h-6 text-emerald-500" />
                  Territory Rankings
                </CardTitle>
                <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
                  <SelectTrigger className="w-[200px]" data-testid="territory-select">
                    <SelectValue placeholder="Select territory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Territories</SelectItem>
                    {territories.map((territory) => (
                      <SelectItem key={territory.id} value={territory.id}>
                        {territory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedTerritory === 'all' ? (
                territoryRankingsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : territoryRankings.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Map className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No territories competing yet!</p>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {territoryRankings.map((territory) => (
                      <motion.div
                        key={territory.territoryId}
                        variants={item}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] cursor-pointer ${getRankStyle(territory.rank)}`}
                        onClick={() => setSelectedTerritory(territory.territoryId)}
                        data-testid={`territory-entry-${territory.territoryId}`}
                      >
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(territory.rank)}
                        </div>
                        
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: territory.emblemColor }}
                        >
                          {territory.territoryName.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-lg">{territory.territoryName}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{Number(territory.playerCount)} sages</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div className="hidden sm:block">
                            <div className="text-sm text-muted-foreground font-semibold">
                              {Number(territory.avgScore).toLocaleString()}
                            </div>
                            <span className="text-xs text-muted-foreground">avg score</span>
                          </div>

                          <div className="min-w-[80px]">
                            <div className="flex items-center justify-end gap-1">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <span className="font-display font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                {Number(territory.totalScore).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground text-right block">total points</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                renderLeaderboard(territoryLeaderboard, territoryLoading)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="country">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <Flag className="w-6 h-6 text-amber-500" />
                  Country Rankings
                </CardTitle>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-[200px]" data-testid="country-select">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.flagEmoji} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {selectedCountry === 'all' ? (
                countryRankingsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : countryRankings.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <Flag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No countries competing yet!</p>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={container}
                    initial="hidden"
                    animate="show"
                  >
                    {countryRankings.map((country) => (
                      <motion.div
                        key={country.countryId}
                        variants={item}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all hover:scale-[1.01] cursor-pointer ${getRankStyle(country.rank)}`}
                        onClick={() => setSelectedCountry(country.countryId)}
                        data-testid={`country-entry-${country.countryId}`}
                      >
                        <div className="flex items-center justify-center w-10">
                          {getRankIcon(country.rank)}
                        </div>
                        
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-gray-100 dark:bg-gray-800">
                          {country.flagEmoji || '🏳️'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-lg">{country.countryName}</span>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{Number(country.playerCount)} sages</span>
                            <span className="text-muted-foreground/50">•</span>
                            <span>{country.territoryName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-right">
                          <div className="hidden sm:block">
                            <div className="text-sm text-muted-foreground font-semibold">
                              {Number(country.avgScore).toLocaleString()}
                            </div>
                            <span className="text-xs text-muted-foreground">avg score</span>
                          </div>

                          <div className="min-w-[80px]">
                            <div className="flex items-center justify-end gap-1">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <span className="font-display font-bold text-xl bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                {Number(country.totalScore).toLocaleString()}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground text-right block">total points</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                renderLeaderboard(countryLeaderboard, countryLoading)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
