import {
  Award,
  Bot,
  ChevronRight,
  Flame,
  Gamepad2,
  Globe2,
  History,
  KeyRound,
  Play,
  Plus,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../store/AuthContext';
import { useGame } from '../store/GameContext';
import { GameHistoryItem, UserStats } from '../types/game';

interface DashboardPageProps {
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  onOpenAiGame: () => void;
  onOpenLocalGame: () => void;
  onOpenAuth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenAiGame,
  onOpenLocalGame,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const { findMatch, isMatchmaking, matchmakingSeconds, cancelMatchmaking, setActiveTab } = useGame();
  const [topPlayers, setTopPlayers] = useState<UserStats[]>([]);
  const [recentGames, setRecentGames] = useState<GameHistoryItem[]>([]);

  useEffect(() => {
    api
      .getLeaderboard(5)
      .then((data) => setTopPlayers(data))
      .catch((err) => console.warn('Error fetching leaderboard snapshot:', err));

    api
      .getGameHistory(4)
      .then((data) => setRecentGames(data))
      .catch((err) => console.warn('Error fetching history snapshot:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner / User Quick Profile */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0f172a] border border-slate-800 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/30">
            {user ? user.username.substring(0, 2).toUpperCase() : <Sparkles className="w-8 h-8 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                {user ? `Welcome, ${user.username}` : 'Welcome to LudoArena'}
              </h2>
              {user?.currentRanking ? (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rank #{user.currentRanking}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {user
                ? 'Ready for battle? Challenge opponents or climb the global leaderboard.'
                : 'Sign in to save your game stats, climb the global leaderboard, and win trophies.'}
            </p>
          </div>
        </div>

        {/* User Stats Quick Pills or Sign In Button */}
        {user ? (
          <div className="flex items-center gap-3 z-10 flex-wrap">
            <div className="bg-slate-900/80 rounded-2xl px-4 py-2.5 text-center border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Matches</span>
              <span className="text-sm font-black text-slate-100">{user.gamesPlayed}</span>
            </div>
            <div className="bg-slate-900/80 rounded-2xl px-4 py-2.5 text-center border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Victories</span>
              <span className="text-sm font-black text-amber-400">{user.gamesWon}</span>
            </div>
            <div className="bg-slate-900/80 rounded-2xl px-4 py-2.5 text-center border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Win Rate</span>
              <span className="text-sm font-black text-emerald-400">{user.winPercentage}%</span>
            </div>
            <div className="bg-slate-900/80 rounded-2xl px-4 py-2.5 text-center border border-slate-800 shadow-inner">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Rating</span>
              <span className="text-sm font-black text-indigo-400">{user.totalScore}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition-transform hover:scale-105 active:scale-95 cursor-pointer z-10 shrink-0"
          >
            Create Account
          </button>
        )}
      </div>

      {/* Main Grid: Game Launchers (Left) & Live Rankings / History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Game Action Launchers */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-indigo-400" />
              Game Modes
            </h3>
            <span className="text-xs text-slate-400 font-medium">Select a mode to enter the arena</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Find Match Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Globe2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  Online
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Online Matchmaking
                </h4>
                <p className="text-xs text-slate-400 mb-6">
                  Play against challengers worldwide with instant room pairing and Elo ranking.
                </p>
              </div>

              {isMatchmaking ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-indigo-500/40">
                  <div className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-xs font-bold text-slate-200">
                      Searching ({matchmakingSeconds}s)...
                    </span>
                  </div>
                  <button
                    onClick={cancelMatchmaking}
                    className="text-xs font-bold text-rose-400 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={findMatch}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Find Match Now
                </button>
              )}
            </div>

            {/* 2. Private Room Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <KeyRound className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  Custom
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Private Multiplayer
                </h4>
                <p className="text-xs text-slate-400 mb-6">
                  Create a custom room with code or join your friend's active lobby.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onOpenCreateRoom}
                  className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-900/20 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Create
                </button>

                <button
                  onClick={onOpenJoinRoom}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer border border-slate-700"
                >
                  Join Code
                </button>
              </div>
            </div>

            {/* 3. AI Opponent Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Practice
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Play Against AI
                </h4>
                <p className="text-xs text-slate-400 mb-6">
                  Test your tactics against Easy, Medium, or Hard computer bots.
                </p>
              </div>

              <button
                onClick={onOpenAiGame}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Start AI Game
              </button>
            </div>

            {/* 4. Pass & Play Card */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  Offline
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  Local Pass & Play
                </h4>
                <p className="text-xs text-slate-400 mb-6">
                  Pass the device around for 2 to 4 players on one screen.
                </p>
              </div>

              <button
                onClick={onOpenLocalGame}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Pass & Play
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Leaderboard Snapshot & History */}
        <div className="space-y-6">
          {/* Leaderboard Snapshot */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Top Champions
              </h3>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                Full List <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {topPlayers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">Loading champions...</div>
              ) : (
                topPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-slate-950'
                            : idx === 1
                              ? 'bg-slate-300 text-slate-900'
                              : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {player.username}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {player.gamesWon} wins ({player.winPercentage}%)
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-indigo-400">
                      {player.totalScore} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Games Snapshot */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Recent Matches
              </h3>
              <button
                onClick={() => setActiveTab('history')}
                className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {recentGames.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No completed matches yet.
                </div>
              ) : (
                recentGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">
                        👑 {game.winner} Won
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {game.gameMode} • {game.totalTurns} turns
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(game.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
