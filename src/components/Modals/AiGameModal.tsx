import { Bot, Cpu, Sparkles, X } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_THEMES } from '../LudoBoard/boardCoords';

interface AiGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAiGame: (
    playerCount: 2 | 4,
    playerColor: PlayerColor,
    difficulty: 'easy' | 'medium' | 'hard'
  ) => void;
}

export const AiGameModal: React.FC<AiGameModalProps> = ({ isOpen, onClose, onCreateAiGame }) => {
  const [playerCount, setPlayerCount] = useState<2 | 4>(4);
  const [playerColor, setPlayerColor] = useState<PlayerColor>('red');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0f172a] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Play Against AI</h3>
            <p className="text-xs text-slate-400">Challenge smart computer opponents</p>
          </div>
        </div>

        {/* Player Count */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Match Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPlayerCount(2)}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                playerCount === 2
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              1 vs 1 (2 Players)
            </button>

            <button
              type="button"
              onClick={() => setPlayerCount(4)}
              className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                playerCount === 4
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Battle Royale (4 Players)
            </button>
          </div>
        </div>

        {/* AI Difficulty */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Bot Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'easy', label: 'Easy', desc: 'Casual moves' },
              { id: 'medium', label: 'Medium', desc: 'Strategic' },
              { id: 'hard', label: 'Hard', desc: 'Aggressive' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id as any)}
                className={`py-2 px-2 rounded-xl border flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  difficulty === d.id
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-xs font-bold">{d.label}</span>
                <span className="text-[9px] opacity-70">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Choice */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Your Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
              const theme = COLOR_THEMES[color];
              const isSelected = playerColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPlayerColor(color)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? `${theme.border} bg-slate-800 shadow-sm`
                      : 'border-slate-800 bg-slate-900/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${theme.bg}`} />
                  <span className="text-[10px] font-bold capitalize text-slate-200">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            onCreateAiGame(playerCount, playerColor, difficulty);
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start AI Battle
        </button>
      </div>
    </div>
  );
};
