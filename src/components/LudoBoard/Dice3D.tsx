import { motion } from 'motion/react';
import React, { useEffect } from 'react';
import { PlayerColor } from '../../types/game';
import { COLOR_THEMES } from './boardCoords';

interface DiceProps {
  value?: number | null;
  isRolling?: boolean;
  canRoll?: boolean;
  disabled?: boolean;
  playerColor?: PlayerColor;
  currentPlayerColor?: PlayerColor;
  onRoll?: () => void;
  onClick?: () => void;
  timerSeconds?: number;
}

export const Dice3D: React.FC<DiceProps> = ({
  value = 1,
  isRolling = false,
  canRoll: propCanRoll,
  disabled = false,
  playerColor,
  currentPlayerColor,
  onRoll,
  onClick,
}) => {
  const colorKey = playerColor || currentPlayerColor || 'red';
  const theme = COLOR_THEMES[colorKey] || COLOR_THEMES.red;
  const isAllowed = propCanRoll !== undefined ? propCanRoll : !disabled;
  const handleTrigger = onClick || onRoll;

  // Spacebar hotkey to roll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isAllowed && !isRolling && handleTrigger) {
        if (e.target === document.body || (e.target as HTMLElement)?.tagName === 'BUTTON') {
          e.preventDefault();
          handleTrigger();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAllowed, isRolling, handleTrigger]);

  const renderDots = (num: number) => {
    const dotClasses = "w-3 h-3 rounded-full bg-slate-900 shadow-sm";
    const centerDot = "w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-sm";

    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className={centerDot} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <div className={`${dotClasses} self-start`} />
            <div className={`${dotClasses} self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <div className={`${dotClasses} self-start`} />
            <div className={`${centerDot} self-center`} />
            <div className={`${dotClasses} self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 p-1.5 place-items-center">
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5 flex items-center justify-center">
            <div className={`absolute top-1.5 left-1.5 ${dotClasses}`} />
            <div className={`absolute top-1.5 right-1.5 ${dotClasses}`} />
            <div className={centerDot} />
            <div className={`absolute bottom-1.5 left-1.5 ${dotClasses}`} />
            <div className={`absolute bottom-1.5 right-1.5 ${dotClasses}`} />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 gap-1 p-1 place-items-center">
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
            <div className={dotClasses} />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className={centerDot} />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Dice Face Container */}
      <motion.button
        id="ludo-dice-button"
        type="button"
        whileHover={isAllowed ? { scale: 1.06 } : {}}
        whileTap={isAllowed ? { scale: 0.95 } : {}}
        animate={
          isRolling
            ? {
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.15, 0.92, 1.1, 1],
                y: [0, -12, 4, -6, 0],
              }
            : isAllowed
              ? {
                  boxShadow: [
                    '0 0 0px rgba(0,0,0,0)',
                    '0 0 20px rgba(99,102,241,0.6)',
                    '0 0 0px rgba(0,0,0,0)',
                  ],
                }
              : {}
        }
        transition={
          isRolling
            ? { duration: 0.45, repeat: Infinity, ease: 'easeInOut' }
            : isAllowed
              ? { duration: 1.6, repeat: Infinity }
              : {}
        }
        onClick={() => {
          if (isAllowed && !isRolling && handleTrigger) {
            handleTrigger();
          }
        }}
        disabled={!isAllowed || isRolling}
        className={`relative w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl flex items-center justify-center transition-all p-2 ${
          isAllowed
            ? 'ring-4 ring-indigo-500/40 cursor-pointer shadow-[0_0_25px_rgba(79,70,229,0.3)]'
            : 'opacity-85 cursor-not-allowed'
        }`}
      >
        {/* Dice Dots */}
        <div className="w-full h-full flex items-center justify-center">
          {renderDots(value || 1)}
        </div>

        {/* 6 Bonus Notification */}
        {value === 6 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-3 -right-3 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider"
          >
            +1 ROLL!
          </motion.span>
        )}
      </motion.button>
    </div>
  );
};
