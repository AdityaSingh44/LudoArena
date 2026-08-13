import { Player, PlayerColor } from '../../../src/types/game';
import { FINAL_HOME_STEP, TOTAL_MAIN_TILES } from './constants.js';
import {
  findCapturedToken,
  getGlobalMainTileIndex,
  isStepSafe,
} from './ludoRules.js';

export function chooseAiMove(
  player: Player,
  validTokenIds: number[],
  diceValue: number,
  allPlayers: Player[],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): number {
  if (validTokenIds.length === 0) return -1;
  if (validTokenIds.length === 1) return validTokenIds[0];

  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * validTokenIds.length);
    return validTokenIds[randomIndex];
  }

  // Calculate scores for each valid move
  let bestTokenId = validTokenIds[0];
  let bestScore = -Infinity;

  for (const tokenId of validTokenIds) {
    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token) continue;

    let score = 0;
    const currentStep = token.stepCount;
    const nextStep = currentStep === -1 ? 0 : currentStep + diceValue;

    // 1. Check if move captures an opponent
    const capture = findCapturedToken(allPlayers, player.color, nextStep);
    if (capture) {
      score += 1000;
    }

    // 2. Check if token reaches home
    if (nextStep === FINAL_HOME_STEP) {
      score += 850;
    }

    // 3. Check if token enters safe home corridor (steps 51..55)
    if (nextStep >= 51 && currentStep < 51) {
      score += 500;
    }

    // 4. Bringing token out of yard on 6
    if (currentStep === -1 && diceValue === 6) {
      const tokensInYard = player.tokens.filter((t) => t.stepCount === -1).length;
      score += 350 + tokensInYard * 50;
    }

    // 5. Landing on a safe star tile
    if (isStepSafe(player.color, nextStep) && !isStepSafe(player.color, currentStep)) {
      score += 300;
    }

    // 6. Hard-mode Threat & Pursuit Analysis
    if (difficulty === 'hard') {
      const currentGlobalTile = getGlobalMainTileIndex(player.color, currentStep);
      const nextGlobalTile = getGlobalMainTileIndex(player.color, nextStep);

      // Threat on current position (escapes danger)
      if (currentGlobalTile !== null && !isStepSafe(player.color, currentStep)) {
        for (const opp of allPlayers) {
          if (opp.color === player.color) continue;
          for (const oppToken of opp.tokens) {
            if (oppToken.isHome || oppToken.stepCount < 0 || oppToken.stepCount > 50) continue;
            const oppGlobal = getGlobalMainTileIndex(opp.color, oppToken.stepCount);
            if (oppGlobal !== null) {
              const distance = (currentGlobalTile - oppGlobal + TOTAL_MAIN_TILES) % TOTAL_MAIN_TILES;
              if (distance >= 1 && distance <= 6) {
                score += 250; // High value to flee!
              }
            }
          }
        }
      }

      // Risk on next position
      if (nextGlobalTile !== null && !isStepSafe(player.color, nextStep)) {
        for (const opp of allPlayers) {
          if (opp.color === player.color) continue;
          for (const oppToken of opp.tokens) {
            if (oppToken.isHome || oppToken.stepCount < 0 || oppToken.stepCount > 50) continue;
            const oppGlobal = getGlobalMainTileIndex(opp.color, oppToken.stepCount);
            if (oppGlobal !== null) {
              const distance = (nextGlobalTile - oppGlobal + TOTAL_MAIN_TILES) % TOTAL_MAIN_TILES;
              if (distance >= 1 && distance <= 6) {
                score -= 180; // Risky move!
              }
            }
          }
        }
      }

      // Prefer moving tokens that are closer to home
      score += nextStep * 5;
    } else {
      // Medium mode: simple progress bonus
      score += nextStep * 2;
    }

    if (score > bestScore) {
      bestScore = score;
      bestTokenId = tokenId;
    }
  }

  return bestTokenId;
}
