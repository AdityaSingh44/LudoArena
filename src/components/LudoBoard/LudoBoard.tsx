import { Sparkles, Star } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useMemo } from 'react';
import { GameState, Player, PlayerColor, TokenState } from '../../types/game';
import {
  COLOR_THEMES,
  CORRIDOR_GRID_COORDS,
  MAIN_PATH_GRID_COORDS,
  SAFE_TILE_INDICES,
  START_TILE_INDICES,
  YARD_SLOT_COORDS,
} from './boardCoords';

interface LudoBoardProps {
  gameState: GameState;
  onTokenClick: (tokenId: number) => void;
  currentPlayerId?: string;
  isLocalMode?: boolean;
}

interface OccupyingToken {
  player: Player;
  token: TokenState;
  color: PlayerColor;
  isSelectable: boolean;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  onTokenClick,
  currentPlayerId,
  isLocalMode = false,
}) => {
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const isMyTurn =
    isLocalMode ||
    (activePlayer && (activePlayer.id === currentPlayerId || (!currentPlayerId && !activePlayer.isAi)));

  // Map every board coordinate to list of tokens currently occupying it
  const cellOccupants = useMemo(() => {
    const map = new Map<string, OccupyingToken[]>();

    gameState.players.forEach((player) => {
      player.tokens.forEach((token) => {
        let coordKey = '';

        if (token.stepCount === -1) {
          // Token in Yard slot
          const yardSlot = YARD_SLOT_COORDS[player.color][token.id];
          coordKey = `${yardSlot[0]}_${yardSlot[1]}`;
        } else if (token.stepCount >= 56) {
          // Token in Center Home
          coordKey = `center_${player.color}`;
        } else if (token.stepCount >= 51) {
          // Token in Corridor (steps 51..55 -> index 0..4)
          const corridorIndex = token.stepCount - 51;
          const coords = CORRIDOR_GRID_COORDS[player.color][corridorIndex];
          coordKey = `${coords[0]}_${coords[1]}`;
        } else {
          // Token on Main Path (steps 0..50)
          const startTile = START_TILE_INDICES[player.color];
          const globalIndex = (startTile + token.stepCount) % 52;
          const coords = MAIN_PATH_GRID_COORDS[globalIndex];
          coordKey = `${coords[0]}_${coords[1]}`;
        }

        const isSelectable =
          isMyTurn &&
          activePlayer?.color === player.color &&
          gameState.hasRolled &&
          gameState.validTokenMoves.includes(token.id);

        const list = map.get(coordKey) || [];
        list.push({
          player,
          token,
          color: player.color,
          isSelectable,
        });
        map.set(coordKey, list);
      });
    });

    return map;
  }, [gameState, isMyTurn, activePlayer]);

  // Check if a grid row/col is in Yard areas
  const getYardColor = (r: number, c: number): PlayerColor | null => {
    if (r >= 0 && r < 6 && c >= 0 && c < 6) return 'red';
    if (r >= 0 && r < 6 && c >= 9 && c < 15) return 'green';
    if (r >= 9 && r < 15 && c >= 9 && c < 15) return 'yellow';
    if (r >= 9 && r < 15 && c >= 0 && c < 6) return 'blue';
    return null;
  };

  // Check if grid row/col is a colored home corridor
  const getCorridorColor = (r: number, c: number): PlayerColor | null => {
    if (r === 7 && c >= 1 && c <= 5) return 'red';
    if (c === 7 && r >= 1 && r <= 5) return 'green';
    if (r === 7 && c >= 9 && c <= 13) return 'yellow';
    if (c === 7 && r >= 9 && r <= 13) return 'blue';
    return null;
  };

  // Check if cell is a starting cell
  const getStartCellColor = (r: number, c: number): PlayerColor | null => {
    if (r === 6 && c === 1) return 'red';
    if (r === 1 && c === 8) return 'green';
    if (r === 8 && c === 13) return 'yellow';
    if (r === 13 && c === 6) return 'blue';
    return null;
  };

  // Check if cell is a safe star
  const isSafeStarCell = (r: number, c: number): boolean => {
    const starCoords = [
      [6, 1],
      [2, 6],
      [1, 8],
      [6, 12],
      [8, 13],
      [12, 8],
      [13, 6],
      [8, 2],
    ];
    return starCoords.some(([sr, sc]) => sr === r && sc === c);
  };

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto select-none p-1 md:p-2 bg-zinc-900 rounded-3xl shadow-2xl border-4 border-zinc-800 flex items-center justify-center">
      {/* 15x15 Grid Board */}
      <div className="w-full h-full grid grid-cols-15 grid-rows-15 bg-zinc-100 dark:bg-zinc-950 rounded-2xl overflow-hidden shadow-inner relative border border-zinc-300 dark:border-zinc-800">
        {/* Render 15x15 Cells */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 15 }).map((_, col) => {
            const yardColor = getYardColor(row, col);
            const corridorColor = getCorridorColor(row, col);
            const startColor = getStartCellColor(row, col);
            const isStar = isSafeStarCell(row, col);
            const isCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            // Don't render individual cells inside center 3x3 block (handled by Center Overlay)
            if (isCenter) {
              return <div key={`${row}-${col}`} className="bg-transparent" />;
            }

            // Yard Area Block background styling
            if (yardColor) {
              const isYardCorner =
                (row === 0 && col === 0) ||
                (row === 0 && col === 9) ||
                (row === 9 && col === 9) ||
                (row === 9 && col === 0);

              if (isYardCorner) {
                const theme = COLOR_THEMES[yardColor];
                return (
                  <div
                    key={`${row}-${col}`}
                    style={{ gridRow: `${row + 1} / span 6`, gridColumn: `${col + 1} / span 6` }}
                    className={`relative p-3 rounded-2xl ${theme.bg} shadow-md flex items-center justify-center border-2 border-zinc-900/10`}
                  >
                    {/* Inner White Yard Base */}
                    <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-xl p-2 shadow-inner grid grid-cols-2 grid-rows-2 gap-2">
                      {[0, 1, 2, 3].map((slotId) => {
                        const [sr, sc] = YARD_SLOT_COORDS[yardColor][slotId];
                        const key = `${sr}_${sc}`;
                        const tokens = cellOccupants.get(key) || [];

                        return (
                          <div
                            key={slotId}
                            className={`w-full h-full rounded-full border-2 border-dashed ${theme.border} bg-zinc-50 dark:bg-zinc-800/80 flex items-center justify-center relative shadow-sm`}
                          >
                            {tokens.map((occ, idx) => (
                              <TokenView
                                key={occ.token.id}
                                occ={occ}
                                onTokenClick={onTokenClick}
                                isStacked={tokens.length > 1}
                                stackIndex={idx}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              // Skip inner cells of yard since span 6 covers them
              return null;
            }

            // Regular Path Cells
            const cellKey = `${row}_${col}`;
            const tokens = cellOccupants.get(cellKey) || [];

            let bgClass = 'bg-white dark:bg-zinc-900 border border-zinc-300/80 dark:border-zinc-800/80';
            if (corridorColor) {
              bgClass = `${COLOR_THEMES[corridorColor].bg} border-zinc-900/10`;
            } else if (startColor) {
              bgClass = `${COLOR_THEMES[startColor].bg} border-zinc-900/20`;
            }

            return (
              <div
                key={cellKey}
                className={`relative w-full h-full flex items-center justify-center transition-colors ${bgClass}`}
              >
                {/* Safe Star Icon */}
                {isStar && (
                  <Star
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                      startColor ? 'text-white' : 'text-zinc-400 dark:text-zinc-600'
                    } fill-current opacity-80`}
                  />
                )}

                {/* Tokens in this Cell */}
                {tokens.length > 0 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {tokens.map((occ, idx) => (
                      <TokenView
                        key={`${occ.player.id}_${occ.token.id}`}
                        occ={occ}
                        onTokenClick={onTokenClick}
                        isStacked={tokens.length > 1}
                        stackIndex={idx}
                        totalStacked={tokens.length}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Center Winning Home (Rows 7-9, Cols 7-9) */}
        <div
          style={{ gridRow: '7 / span 3', gridColumn: '7 / span 3' }}
          className="relative w-full h-full bg-zinc-950 border border-zinc-700 overflow-hidden shadow-inner"
        >
          {/* SVG 4-Color Triangles */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Top Green Triangle */}
            <polygon points="0,0 100,0 50,50" className="fill-emerald-500" />
            {/* Right Yellow Triangle */}
            <polygon points="100,0 100,100 50,50" className="fill-amber-400" />
            {/* Bottom Blue Triangle */}
            <polygon points="100,100 0,100 50,50" className="fill-sky-500" />
            {/* Left Red Triangle */}
            <polygon points="0,100 0,0 50,50" className="fill-rose-500" />
          </svg>

          {/* Center Crown / Trophy */}
          <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-zinc-950/80 backdrop-blur-sm border border-amber-400/50 flex items-center justify-center shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          </div>

          {/* Center Tokens Count */}
          {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
            const homeTokens = cellOccupants.get(`center_${color}`) || [];
            if (homeTokens.length === 0) return null;

            const posClasses: Record<PlayerColor, string> = {
              red: 'top-1/2 -translate-y-1/2 left-1.5',
              green: 'top-1.5 left-1/2 -translate-x-1/2',
              yellow: 'top-1/2 -translate-y-1/2 right-1.5',
              blue: 'bottom-1.5 left-1/2 -translate-x-1/2',
            };

            return (
              <div
                key={color}
                className={`absolute ${posClasses[color]} bg-zinc-950 text-white font-black text-[9px] px-1 py-0.5 rounded-full shadow border border-white/20`}
              >
                {homeTokens.length} 🏆
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface TokenViewProps {
  occ: OccupyingToken;
  onTokenClick: (tokenId: number) => void;
  isStacked?: boolean;
  stackIndex?: number;
  totalStacked?: number;
}

const TokenView: React.FC<TokenViewProps> = ({
  occ,
  onTokenClick,
  isStacked = false,
  stackIndex = 0,
  totalStacked = 1,
}) => {
  const theme = COLOR_THEMES[occ.color];

  // Offset slightly if stacked
  const offset = isStacked ? (stackIndex - (totalStacked - 1) / 2) * 4 : 0;

  return (
    <motion.button
      type="button"
      layout
      whileHover={occ.isSelectable ? { scale: 1.25 } : {}}
      whileTap={occ.isSelectable ? { scale: 0.9 } : {}}
      animate={
        occ.isSelectable
          ? {
              y: [0, -6, 0],
              scale: [1, 1.15, 1],
              boxShadow: [
                '0 0 0px rgba(0,0,0,0)',
                '0 0 12px rgba(255,255,255,0.9)',
                '0 0 0px rgba(0,0,0,0)',
              ],
            }
          : {}
      }
      transition={occ.isSelectable ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
      onClick={(e) => {
        e.stopPropagation();
        if (occ.isSelectable) {
          onTokenClick(occ.token.id);
        }
      }}
      style={{ transform: `translate(${offset}px, ${offset}px)` }}
      className={`absolute w-5 h-5 md:w-6 md:h-6 rounded-full bg-gradient-to-br ${theme.tokenBg} border-2 border-white shadow-lg flex items-center justify-center z-10 transition-all ${
        occ.isSelectable ? 'cursor-pointer ring-2 ring-amber-300 ring-offset-1 z-30' : 'cursor-default'
      }`}
    >
      {/* Token inner core */}
      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/90 shadow-inner" />

      {/* Stack Count Badge */}
      {isStacked && stackIndex === totalStacked - 1 && (
        <span className="absolute -top-2 -right-2 bg-zinc-950 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
          {totalStacked}
        </span>
      )}
    </motion.button>
  );
};
