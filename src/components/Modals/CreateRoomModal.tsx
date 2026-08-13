import { Users, X } from 'lucide-react';
import React, { useState } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_THEMES } from '../LudoBoard/boardCoords';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (preferredColor: PlayerColor) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [selectedColor, setSelectedColor] = useState<PlayerColor>('red');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#0f172a] rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create Private Room</h3>
            <p className="text-xs text-slate-400">Play with friends via unique room code</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Select Your Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
              const theme = COLOR_THEMES[color];
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${theme.border} bg-slate-800 shadow-md ring-2 ring-indigo-500/50`
                      : 'border-slate-800 bg-slate-900/60 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${theme.bg}`} />
                  <span className="text-[11px] font-bold capitalize text-slate-200">
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => {
            onCreate(selectedColor);
            onClose();
          }}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
        >
          Generate Room & Invite
        </button>
      </div>
    </div>
  );
};
