import {
  Award,
  Bot,
  ChevronRight,
  Dices,
  Gamepad2,
  Globe2,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useGame } from '../store/GameContext';

interface LandingPageProps {
  onOpenCreateRoom: () => void;
  onOpenJoinRoom: () => void;
  onOpenAiGame: () => void;
  onOpenLocalGame: () => void;
  onOpenAuth: () => void;
  onOpenRules: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenCreateRoom,
  onOpenJoinRoom,
  onOpenAiGame,
  onOpenLocalGame,
  onOpenAuth,
  onOpenRules,
}) => {
  const { user } = useAuth();
  const { findMatch, isMatchmaking, matchmakingSeconds, cancelMatchmaking } = useGame();

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Next-Gen Real-Time Multiplayer Arena
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6">
            Master the Board.{' '}
            <span className="text-indigo-400">
              Claim Victory.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Real-time multiplayer Ludo built with server-authoritative physics, smart AI bots, live in-game chat, and global Elo leaderboards.
          </p>

          {/* Quick Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 max-w-xl mx-auto">
            {isMatchmaking ? (
              <div className="flex items-center gap-3 p-2.5 pr-4 bg-slate-900 text-white rounded-2xl border border-indigo-500 shadow-2xl animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <Globe2 className="w-4 h-4 animate-spin text-white" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block">Finding Match...</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Queue time: {matchmakingSeconds}s
                  </span>
                </div>
                <button
                  onClick={cancelMatchmaking}
                  className="ml-2 text-xs font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={findMatch}
                className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Globe2 className="w-4 h-4" />
                Find Online Match
              </button>
            )}

            <button
              onClick={onOpenCreateRoom}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              Create Private Room
            </button>

            <button
              onClick={onOpenAiGame}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              Play vs AI
            </button>
          </div>
        </div>
      </section>

      {/* Game Modes Showcase Grid */}
      <section className="max-w-6xl w-full mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            Four Battle Modes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From ranked online matchmaking to tactical AI skirmishes and couch pass-and-play
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Mode 1: Online Matchmaking */}
          <div
            onClick={findMatch}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Online Matchmaking
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Instant 1v1 and 4-player competitive matchmaking with live Elo rating updates.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Find Match <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mode 2: Private Room */}
          <div
            onClick={onOpenCreateRoom}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Private Rooms
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Create a private lobby with a unique 6-character room code and invite friends.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Create Room <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mode 3: Smart AI */}
          <div
            onClick={onOpenAiGame}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Play Against AI
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Sharpen your tactical skills against adaptive bots with Easy, Medium, and Hard strategies.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Battle AI <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Mode 4: Local Pass & Play */}
          <div
            onClick={onOpenLocalGame}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">
                Pass & Play
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Gather 2 to 4 players around a single device for classic couch multiplayer fun.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              Play Local <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-6xl w-full mx-auto px-4 py-10">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 text-white grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1 text-white">Server-Authoritative</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dice outcomes, captures, and movement paths are verified on the Node.js server engine.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1 text-white">Zero-Lag Sync</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Socket.IO real-time channels ensure millisecond state synchronization across all players.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1 text-white">Global Leaderboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Climb the ranks with persistent match tracking, win rates, and ranking achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Dices className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-300">LudoArena</span>
          <span>•</span>
          <span>Production Real-Time Multiplayer</span>
        </div>
        <p className="text-[11px] text-slate-600">Built with React, TypeScript, Express, Socket.IO & MongoDB</p>
      </footer>
    </div>
  );
};
