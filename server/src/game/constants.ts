import { PlayerColor } from '../../../src/types/game';

export const COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

// Start tile indices on the 52-tile common track
export const START_TILES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe tile indices on the 52-tile common track
export const SAFE_TILES: number[] = [0, 8, 13, 21, 26, 34, 39, 47];

export const TOTAL_MAIN_TILES = 52;
export const HOME_CORRIDOR_LENGTH = 5;
export const FINAL_HOME_STEP = 56; // 0..50 (51 main path steps), 51..55 (5 corridor steps), 56 (home)

export const TURN_DURATION_SECONDS = 30;
export const RECONNECT_GRACE_PERIOD_SECONDS = 45;

// Grid coordinates for the 52 main path tiles on a 15x15 board (0-indexed: [row, col])
export const MAIN_PATH_COORDINATES: [number, number][] = [
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

// Colored home corridor coordinates (steps 51 to 55)
export const HOME_CORRIDORS: Record<PlayerColor, [number, number][]> = {
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

// Center finish coordinates for each color
export const HOME_CENTER: Record<PlayerColor, [number, number]> = {
  red: [7, 6],
  green: [6, 7],
  yellow: [7, 8],
  blue: [8, 7],
};

// Yard spawn slot coordinates (4 tokens per color)
export const YARD_SLOTS: Record<PlayerColor, [number, number][]> = {
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
