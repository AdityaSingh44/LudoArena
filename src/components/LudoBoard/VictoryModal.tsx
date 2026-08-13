import confetti from 'canvas-confetti';
import { ArrowLeft, Award, Crown, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect } from 'react';
import { GameState, PlayerColor } from '../../types/game';
import { COLOR_THEMES } from './boardCoords';

interface VictoryModalProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onExit: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ gameState, onPlayAgain, onExit }) => {
  const winnerPlayer = gameState.players.find((p) => p.color === gameState.winner);
  const winnerTheme = gameState.winner ? COLOR_THEMES[gameState.winner] : COLOR_THEMES.red;

  useEffect(() => {
    // Trigger celebratory confetti cannon
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#10b981', '#fbbf24', '#f43f5e'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#10b981', '#fbbf24', '#f43f5e'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Sorted players by rank
  const rankedPlayers = [...gameState.players].sort((a, b) => {
    if (a.rank && b.rank) return a.rank - b.rank;
    if (a.rank) return -1;
    if (b.rank) return 1;
    const aHome = a.tokens.filter((t) => t.isHome).length;
    const bHome = b.tokens.filter((t) => t.isHome).length;
    return bHome - aHome;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 22 }}
        className="w-full max-w-md bg-[#0f172a] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-center relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-30 bg-indigo-600" />

        {/* Crown & Trophy Icon */}
        <div className="relative mb-4 inline-block">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center shadow-lg mx-auto">
            <Trophy className="w-9 h-9 md:w-10 md:h-10 text-slate-950" />
          </div>
          <Crown className="w-6 h-6 text-amber-400 absolute -top-3 -right-2 animate-bounce" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
          {winnerPlayer?.username} Wins!
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Arena match completed in {gameState.totalTurns} turns ({Math.floor((Date.now() - gameState.createdAt) / 1000)}s)
        </p>

        {/* Leaderboard Podium List */}
        <div className="bg-slate-900/80 rounded-2xl p-3 mb-6 border border-slate-800 space-y-2">
          {rankedPlayers.map((player, idx) => {
            const pTheme = COLOR_THEMES[player.color];
            const rank = player.rank || idx + 1;
            const homeTokens = player.tokens.filter((t) => t.isHome).length;

            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950'
                        : rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    #{rank}
                  </span>

                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">
                      {player.username}
                    </span>
                    <span className={`text-[10px] capitalize font-medium ${pTheme.text}`}>
                      {pTheme.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px] font-semibold text-slate-400">
                    {homeTokens}/4 Tokens
                  </div>
                  {rank === 1 ? (
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> +50 pts
                    </span>
                  ) : rank === 2 ? (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      +20 pts
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-700/40 px-2 py-0.5 rounded-full">
                      -15 pts
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Arena Home
          </button>

          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};
