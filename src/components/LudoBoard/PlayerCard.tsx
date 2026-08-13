import { Bot, Crown, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Player } from '../../types/game';
import { COLOR_THEMES } from './boardCoords';

interface PlayerCardProps {
  player: Player;
  isCurrentTurn: boolean;
  turnStartedAt?: number;
  turnDuration?: number;
  isLocal?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isCurrentTurn,
  turnStartedAt,
  turnDuration = 30,
}) => {
  const theme = COLOR_THEMES[player.color];
  const [timeLeft, setTimeLeft] = useState<number>(turnDuration);

  useEffect(() => {
    if (!isCurrentTurn || !turnStartedAt) {
      setTimeLeft(turnDuration);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartedAt) / 1000);
      const remaining = Math.max(0, turnDuration - elapsed);
      setTimeLeft(remaining);
    }, 200);

    return () => clearInterval(interval);
  }, [isCurrentTurn, turnStartedAt, turnDuration]);

  const tokensInYard = player.tokens.filter((t) => t.stepCount === -1).length;
  const tokensHome = player.tokens.filter((t) => t.isHome).length;
  const tokensOnTrack = 4 - tokensInYard - tokensHome;

  return (
    <motion.div
      layout
      className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-indigo-500/10 border border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/40'
          : 'bg-slate-800/40 border border-slate-700/50 opacity-80'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Left vertical color pill */}
        <div className={`w-2 h-8 rounded-full shrink-0 ${theme.bg}`} />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-white truncate">{player.username}</p>
            {player.hasWon && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
            {player.isAi && <Bot className="w-3 h-3 text-slate-400 shrink-0" />}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-[10px]">
            <span className={isCurrentTurn ? 'text-indigo-400 font-medium' : 'text-slate-500'}>
              {isCurrentTurn ? 'Your Turn' : 'Waiting...'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              {tokensHome}/4 <span className="text-emerald-400">Home</span>
            </span>
          </div>
        </div>
      </div>

      {/* Right side: Countdown circle if current turn, or rank/status */}
      <div className="shrink-0 flex items-center gap-2">
        {isCurrentTurn ? (
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
            {timeLeft}s
          </div>
        ) : player.rank ? (
          <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-black flex items-center justify-center">
            #{player.rank}
          </div>
        ) : !player.isAi ? (
          player.isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400/70" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          )
        ) : null}
      </div>
    </motion.div>
  );
};
