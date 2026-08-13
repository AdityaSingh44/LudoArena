import { Gamepad2, X } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_THEMES } from '../LudoBoard/boardCoords';

interface LocalGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLocalGame: (
    players: { name: string; color: PlayerColor; avatar: string }[]
  ) => void;
}

export const LocalGameModal: React.FC<LocalGameModalProps> = ({ isOpen, onClose, onCreateLocalGame }) => {
  const [playerCount, setPlayerCount] = useState<2 | 4>(4);
  const [playerNames, setPlayerNames] = useState<Record<PlayerColor, string>>({
    red: 'Player 1',
    green: 'Player 2',
    yellow: 'Player 3',
    blue: 'Player 4',
  });

  if (!isOpen) return null;

  const activeColors: PlayerColor[] = playerCount === 2 ? ['red', 'yellow'] : ['red', 'green', 'yellow', 'blue'];

  const handleStart = () => {
    const players = activeColors.map((color, idx) => ({
      name: playerNames[color]?.trim() || `Player ${idx + 1}`,
      color,
      avatar: `avatar-${idx + 1}`,
    }));
    onCreateLocalGame(players);
    onClose();
  };

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
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Local Pass & Play</h3>
            <p className="text-xs text-slate-400">Play on the same screen together</p>
          </div>
        </div>

        {/* Player Count */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Number of Players
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPlayerCount(2)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                playerCount === 2
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              2 Players (Red vs Yellow)
            </button>

            <button
              type="button"
              onClick={() => setPlayerCount(4)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                playerCount === 4
                  ? 'border-amber-500 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              4 Players (All Colors)
            </button>
          </div>
        </div>

        {/* Custom Names */}
        <div className="mb-6 space-y-2.5">
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Player Names
          </label>
          {activeColors.map((color) => {
            const theme = COLOR_THEMES[color];
            return (
              <div key={color} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full ${theme.bg} shrink-0`} />
                <input
                  type="text"
                  value={playerNames[color]}
                  onChange={(e) =>
                    setPlayerNames((prev) => ({ ...prev, [color]: e.target.value }))
                  }
                  placeholder={`Name for ${theme.name}`}
                  maxLength={15}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
        >
          Start Local Game
        </button>
      </div>
    </div>
  );
};
