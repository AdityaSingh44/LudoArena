import { Player, PlayerColor, TokenState } from '../../../src/types/game';
import {
  FINAL_HOME_STEP,
  SAFE_TILES,
  START_TILES,
  TOTAL_MAIN_TILES,
} from './constants.js';

export function rollDiceValue(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Returns the global 0..51 main tile index for a token on the main track.
 * Returns null if the token is in yard or inside the colored home corridor.
 */
export function getGlobalMainTileIndex(color: PlayerColor, stepCount: number): number | null {
  if (stepCount < 0 || stepCount > 50) {
    return null;
  }
  return (START_TILES[color] + stepCount) % TOTAL_MAIN_TILES;
}

/**
 * Check if the given step count corresponds to a safe location.
 */
export function isStepSafe(color: PlayerColor, stepCount: number): boolean {
  if (stepCount < 0 || stepCount >= 51) {
    // Yard or home corridor is completely safe
    return true;
  }
  const globalTile = getGlobalMainTileIndex(color, stepCount);
  if (globalTile === null) return true;
  return SAFE_TILES.includes(globalTile);
}

/**
 * Determines which token IDs can legally move given the current dice value.
 */
export function getValidTokenMoves(player: Player, diceValue: number): number[] {
  const validIds: number[] = [];

  for (const token of player.tokens) {
    if (token.isHome || token.stepCount >= FINAL_HOME_STEP) {
      continue;
    }

    if (token.stepCount === -1) {
      // In Yard: Only moves if rolled a 6
      if (diceValue === 6) {
        validIds.push(token.id);
      }
    } else {
      // On track or corridor
      const nextStep = token.stepCount + diceValue;
      if (nextStep <= FINAL_HOME_STEP) {
        validIds.push(token.id);
      }
    }
  }

  return validIds;
}

export interface CaptureResult {
  capturedColor: PlayerColor;
  capturedTokenId: number;
}

/**
 * Checks if landing at targetStepCount captures an opponent's token.
 * Note: Only tokens on the shared 0..50 main track on non-safe tiles can be captured.
 */
export function findCapturedToken(
  players: Player[],
  movingColor: PlayerColor,
  targetStepCount: number
): CaptureResult | null {
  // Corridors and home cannot capture
  if (targetStepCount < 0 || targetStepCount > 50) {
    return null;
  }

  const landingGlobalTile = getGlobalMainTileIndex(movingColor, targetStepCount);
  if (landingGlobalTile === null || SAFE_TILES.includes(landingGlobalTile)) {
    return null;
  }

  for (const opponent of players) {
    if (opponent.color === movingColor || !opponent.tokens) continue;

    for (const token of opponent.tokens) {
      if (token.isHome || token.stepCount < 0 || token.stepCount > 50) continue;

      const oppGlobalTile = getGlobalMainTileIndex(opponent.color, token.stepCount);
      if (oppGlobalTile === landingGlobalTile) {
        return {
          capturedColor: opponent.color,
          capturedTokenId: token.id,
        };
      }
    }
  }

  return null;
}

/**
 * Checks if all 4 tokens of a player have reached home (stepCount = 56).
 */
export function checkPlayerWon(player: Player): boolean {
  if (!player.tokens || player.tokens.length === 0) return false;
  return player.tokens.every((token) => token.isHome || token.stepCount >= FINAL_HOME_STEP);
}

/**
 * Computes human-readable position string for a token.
 */
export function getPositionKey(color: PlayerColor, stepCount: number, tokenId: number): string {
  if (stepCount === -1) {
    return `yard_${color}_${tokenId}`;
  }
  if (stepCount >= FINAL_HOME_STEP) {
    return `home_${color}_${tokenId}`;
  }
  if (stepCount >= 51) {
    const corridorIndex = stepCount - 50; // 1..5
    return `corridor_${color}_${corridorIndex}`;
  }
  const globalTile = getGlobalMainTileIndex(color, stepCount);
  return `tile_${globalTile}`;
}
