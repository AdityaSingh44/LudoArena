import { PlayerColor } from '../../types/game';

// 15x15 Grid Coordinate mapping: [row, col] (0-indexed)
export const MAIN_PATH_GRID_COORDS: [number, number][] = [
  [6, 1],   // 0: Red Start (Safe)
  [6, 2],   // 1
  [6, 3],   // 2
  [6, 4],   // 3
  [6, 5],   // 4
  [5, 6],   // 5
  [4, 6],   // 6
  [3, 6],   // 7
  [2, 6],   // 8: Safe Star
  [1, 6],   // 9
  [0, 6],   // 10
  [0, 7],   // 11
  [0, 8],   // 12
  [1, 8],   // 13: Green Start (Safe)
  [2, 8],   // 14
  [3, 8],   // 15
  [4, 8],   // 16
  [5, 8],   // 17
  [6, 9],   // 18
  [6, 10],  // 19
  [6, 11],  // 20
  [6, 12],  // 21: Safe Star
  [6, 13],  // 22
  [6, 14],  // 23
  [7, 14],  // 24
  [8, 14],  // 25
  [8, 13],  // 26: Yellow Start (Safe)
  [8, 12],  // 27
  [8, 11],  // 28
  [8, 10],  // 29
  [8, 9],   // 30
  [9, 8],   // 31
  [10, 8],  // 32
  [11, 8],  // 33
  [12, 8],  // 34: Safe Star
  [13, 8],  // 35
  [14, 8],  // 36
  [14, 7],  // 37
  [14, 6],  // 38
  [13, 6],  // 39: Blue Start (Safe)
  [12, 6],  // 40
  [11, 6],  // 41
  [10, 6],  // 42
  [9, 6],   // 43
  [8, 5],   // 44
  [8, 4],   // 45
  [8, 3],   // 46
  [8, 2],   // 47: Safe Star
  [8, 1],   // 48
  [8, 0],   // 49
  [7, 0],   // 50
  [6, 0],   // 51
];

export const CORRIDOR_GRID_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [7, 1],
    [7, 2],
    [7, 3],
    [7, 4],
    [7, 5],
  ],
  green: [
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
  ],
  yellow: [
    [7, 13],
    [7, 12],
    [7, 11],
    [7, 10],
    [7, 9],
  ],
  blue: [
    [13, 7],
    [12, 7],
    [11, 7],
    [10, 7],
    [9, 7],
  ],
};

export const YARD_SLOT_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
  ],
  green: [
    [2, 11],
    [2, 12],
    [3, 11],
    [3, 12],
  ],
  yellow: [
    [11, 11],
    [11, 12],
    [12, 11],
    [12, 12],
  ],
  blue: [
    [11, 2],
    [11, 3],
    [12, 2],
    [12, 3],
  ],
};

export const CENTER_HOME_COORDS: Record<PlayerColor, [number, number]> = {
  red: [7, 6],
  green: [6, 7],
  yellow: [7, 8],
  blue: [8, 7],
};

export const SAFE_TILE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];
export const START_TILE_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const COLOR_THEMES: Record<
  PlayerColor,
  {
    name: string;
    bg: string;
    border: string;
    text: string;
    glow: string;
    light: string;
    dark: string;
    tokenBg: string;
  }
> = {
  red: {
    name: 'Red',
    bg: 'bg-rose-500',
    border: 'border-rose-500',
    text: 'text-rose-500',
    glow: 'shadow-rose-500/50',
    light: 'bg-rose-50',
    dark: 'bg-rose-950',
    tokenBg: 'from-rose-500 via-rose-600 to-rose-700',
  },
  green: {
    name: 'Green',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500',
    text: 'text-emerald-500',
    glow: 'shadow-emerald-500/50',
    light: 'bg-emerald-50',
    dark: 'bg-emerald-950',
    tokenBg: 'from-emerald-500 via-emerald-600 to-emerald-700',
  },
  yellow: {
    name: 'Yellow',
    bg: 'bg-amber-400',
    border: 'border-amber-400',
    text: 'text-amber-500',
    glow: 'shadow-amber-400/50',
    light: 'bg-amber-50',
    dark: 'bg-amber-950',
    tokenBg: 'from-amber-400 via-amber-500 to-amber-600',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-sky-500',
    border: 'border-sky-500',
    text: 'text-sky-500',
    glow: 'shadow-sky-500/50',
    light: 'bg-sky-50',
    dark: 'bg-sky-950',
    tokenBg: 'from-sky-500 via-sky-600 to-sky-700',
  },
};
