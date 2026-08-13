import {
  ChatMessage,
  GameMode,
  GameState,
  GameStatus,
  Player,
  PlayerColor,
  TokenState,
} from '../../../src/types/game';
import { chooseAiMove } from './aiEngine.js';
import {
  FINAL_HOME_STEP,
  TURN_DURATION_SECONDS,
} from './constants.js';
import {
  checkPlayerWon,
  findCapturedToken,
  getPositionKey,
  getValidTokenMoves,
  rollDiceValue,
} from './ludoRules.js';

export class LudoGame {
  public roomId: string;
  public gameMode: GameMode;
  public status: GameStatus = 'waiting';
  public players: Player[] = [];
  public currentTurnIndex: number = 0;
  public diceValue: number | null = null;
  public hasRolled: boolean = false;
  public consecutiveSixes: number = 0;
  public validTokenMoves: number[] = [];
  public turnStartedAt: number = Date.now();
  public turnDuration: number = TURN_DURATION_SECONDS;
  public winner: PlayerColor | null = null;
  public rankings: PlayerColor[] = [];
  public totalTurns: number = 0;
  public createdAt: number = Date.now();
  public lastActionAt: number = Date.now();
  public chatMessages: ChatMessage[] = [];
  public lastMove?: GameState['lastMove'];

  private onStateChange?: (game: LudoGame) => void;
  private onTurnTimeout?: (game: LudoGame) => void;
  private turnTimer: NodeJS.Timeout | null = null;
  private aiActionTimeout: NodeJS.Timeout | null = null;

  constructor(
    roomId: string,
    gameMode: GameMode,
    onStateChange?: (game: LudoGame) => void,
    onTurnTimeout?: (game: LudoGame) => void
  ) {
    this.roomId = roomId;
    this.gameMode = gameMode;
    this.onStateChange = onStateChange;
    this.onTurnTimeout = onTurnTimeout;
  }

  public addPlayer(player: Player): boolean {
    if (this.status !== 'waiting' && this.gameMode !== 'local') {
      // Check if reconnecting existing player
      const existing = this.players.find((p) => p.id === player.id || (player.userId && p.userId === player.userId));
      if (existing) {
        existing.isConnected = true;
        existing.id = player.id; // update socket id
        this.notifyChange();
        return true;
      }
      return false;
    }

    if (this.players.length >= 4) {
      return false;
    }

    // Ensure tokens are initialized
    player.tokens = this.createInitialTokens(player.color);
    player.hasWon = false;
    this.players.push(player);
    this.notifyChange();
    return true;
  }

  public removePlayer(playerId: string): void {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    if (this.status === 'waiting') {
      this.players = this.players.filter((p) => p.id !== playerId);
      this.notifyChange();
    } else {
      player.isConnected = false;
      player.disconnectedAt = Date.now();
      this.notifyChange();
    }
  }

  public setPlayerReady(playerId: string, isReady: boolean): void {
    const player = this.players.find((p) => p.id === playerId);
    if (player) {
      player.isReady = isReady;
      this.notifyChange();
    }
  }

  public startGame(): boolean {
    if (this.players.length < 2) return false;

    this.status = 'in_progress';
    this.currentTurnIndex = 0;
    this.diceValue = null;
    this.hasRolled = false;
    this.consecutiveSixes = 0;
    this.validTokenMoves = [];
    this.winner = null;
    this.rankings = [];
    this.totalTurns = 0;
    this.createdAt = Date.now();
    this.lastActionAt = Date.now();

    // Initialize all player tokens
    for (const player of this.players) {
      player.tokens = this.createInitialTokens(player.color);
      player.hasWon = false;
      player.rank = undefined;
    }

    this.startTurn();
    return true;
  }

  public startTurn(): void {
    this.clearTurnTimer();
    this.hasRolled = false;
    this.diceValue = null;
    this.validTokenMoves = [];
    this.turnStartedAt = Date.now();
    this.lastActionAt = Date.now();

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    // Check if player has already won or is disconnected
    if (currentPlayer.hasWon) {
      this.advanceToNextTurn();
      return;
    }

    // Set 30-second turn timeout
    this.turnTimer = setTimeout(() => {
      this.handleTurnTimeout();
    }, this.turnDuration * 1000);

    this.notifyChange();

    // Trigger AI if it's an AI bot's turn
    if (currentPlayer.isAi) {
      this.scheduleAiTurn();
    }
  }

  public rollDice(playerId: string): { success: boolean; diceValue?: number; error?: string } {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, error: 'No active player' };
    }

    if (currentPlayer.id !== playerId && !currentPlayer.isAi) {
      return { success: false, error: 'Not your turn' };
    }

    if (this.hasRolled) {
      return { success: false, error: 'Already rolled for this turn' };
    }

    const value = rollDiceValue();
    this.diceValue = value;
    this.hasRolled = true;
    this.lastActionAt = Date.now();

    if (value === 6) {
      this.consecutiveSixes++;
    } else {
      this.consecutiveSixes = 0;
    }

    // Rule: 3 consecutive sixes loses turn
    if (this.consecutiveSixes >= 3) {
      this.consecutiveSixes = 0;
      this.validTokenMoves = [];
      this.notifyChange();
      setTimeout(() => {
        this.advanceToNextTurn();
      }, 1200);
      return { success: true, diceValue: value };
    }

    this.validTokenMoves = getValidTokenMoves(currentPlayer, value);

    // If no moves are possible, automatically pass turn after brief visual pause
    if (this.validTokenMoves.length === 0) {
      this.notifyChange();
      setTimeout(() => {
        this.advanceToNextTurn();
      }, 1200);
    } else {
      this.notifyChange();
      // If AI turn and has valid moves, schedule the token movement
      if (currentPlayer.isAi) {
        this.scheduleAiTokenMove();
      }
    }

    return { success: true, diceValue: value };
  }

  public moveToken(
    playerId: string,
    tokenId: number
  ): { success: boolean; error?: string; moveData?: GameState['lastMove'] } {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) {
      return { success: false, error: 'No active player' };
    }

    if (currentPlayer.id !== playerId && !currentPlayer.isAi) {
      return { success: false, error: 'Not your turn' };
    }

    if (!this.hasRolled || this.diceValue === null) {
      return { success: false, error: 'Must roll dice before moving' };
    }

    if (!this.validTokenMoves.includes(tokenId)) {
      return { success: false, error: 'Invalid move for selected token' };
    }

    const token = currentPlayer.tokens.find((t) => t.id === tokenId);
    if (!token) {
      return { success: false, error: 'Token not found' };
    }

    const fromStep = token.stepCount;
    let toStep = fromStep;

    if (fromStep === -1) {
      // Spawn out of yard
      toStep = 0;
    } else {
      toStep = fromStep + this.diceValue;
    }

    token.stepCount = toStep;
    token.position = getPositionKey(currentPlayer.color, toStep, tokenId);
    token.isHome = toStep >= FINAL_HOME_STEP;

    let extraTurn = this.diceValue === 6 || token.isHome;
    let capturedColor: PlayerColor | undefined;
    let capturedTokenId: number | undefined;

    // Check for captures on common track
    const capture = findCapturedToken(this.players, currentPlayer.color, toStep);
    if (capture) {
      capturedColor = capture.capturedColor;
      capturedTokenId = capture.capturedTokenId;
      extraTurn = true; // Capturing awards an extra turn!

      // Reset captured token to yard
      const victim = this.players.find((p) => p.color === capture.capturedColor);
      if (victim) {
        const victimToken = victim.tokens.find((t) => t.id === capture.capturedTokenId);
        if (victimToken) {
          victimToken.stepCount = -1;
          victimToken.position = getPositionKey(victim.color, -1, victimToken.id);
          victimToken.isHome = false;
        }
      }
    }

    this.lastMove = {
      playerColor: currentPlayer.color,
      tokenId,
      fromStep,
      toStep,
      capturedColor,
      capturedTokenId,
      isHome: token.isHome,
    };

    // Check if current player just won
    if (checkPlayerWon(currentPlayer)) {
      currentPlayer.hasWon = true;
      if (!this.rankings.includes(currentPlayer.color)) {
        this.rankings.push(currentPlayer.color);
        currentPlayer.rank = this.rankings.length;
      }

      if (!this.winner) {
        this.winner = currentPlayer.color;
      }

      // Check if game is completely finished (all or all but 1 player won)
      const remainingActive = this.players.filter((p) => !p.hasWon);
      if (remainingActive.length <= 1) {
        if (remainingActive.length === 1) {
          const lastPlayer = remainingActive[0];
          this.rankings.push(lastPlayer.color);
          lastPlayer.rank = this.rankings.length;
        }
        this.status = 'completed';
        this.clearTurnTimer();
        this.notifyChange();
        return { success: true, moveData: this.lastMove };
      }
    }

    this.validTokenMoves = [];
    this.totalTurns++;
    this.notifyChange();

    // If extra turn granted, restart turn for same player, otherwise next player
    if (extraTurn && !currentPlayer.hasWon) {
      setTimeout(() => {
        this.startTurn();
      }, 500);
    } else {
      setTimeout(() => {
        this.advanceToNextTurn();
      }, 500);
    }

    return { success: true, moveData: this.lastMove };
  }

  public advanceToNextTurn(): void {
    this.clearTurnTimer();
    this.diceValue = null;
    this.hasRolled = false;
    this.validTokenMoves = [];

    if (this.status === 'completed') return;

    // Advance to next active player who has not won
    let attempts = 0;
    do {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
      attempts++;
    } while (this.players[this.currentTurnIndex]?.hasWon && attempts < this.players.length);

    this.startTurn();
  }

  private handleTurnTimeout(): void {
    if (this.status !== 'in_progress') return;

    // If current player has rolled but not moved, auto-pick first valid token
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer && this.hasRolled && this.validTokenMoves.length > 0) {
      const autoTokenId = this.validTokenMoves[0];
      this.moveToken(currentPlayer.id, autoTokenId);
    } else {
      this.advanceToNextTurn();
    }

    if (this.onTurnTimeout) {
      this.onTurnTimeout(this);
    }
  }

  private scheduleAiTurn(): void {
    if (this.aiActionTimeout) clearTimeout(this.aiActionTimeout);

    const delay = 600 + Math.random() * 600;
    this.aiActionTimeout = setTimeout(() => {
      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer && currentPlayer.isAi && !this.hasRolled) {
        this.rollDice(currentPlayer.id);
      }
    }, delay);
  }

  private scheduleAiTokenMove(): void {
    if (this.aiActionTimeout) clearTimeout(this.aiActionTimeout);

    const delay = 500 + Math.random() * 500;
    this.aiActionTimeout = setTimeout(() => {
      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer && currentPlayer.isAi && this.hasRolled && this.validTokenMoves.length > 0) {
        const bestMove = chooseAiMove(
          currentPlayer,
          this.validTokenMoves,
          this.diceValue || 1,
          this.players,
          currentPlayer.aiDifficulty || 'medium'
        );
        this.moveToken(currentPlayer.id, bestMove);
      }
    }, delay);
  }

  public getCurrentPlayer(): Player | undefined {
    return this.players[this.currentTurnIndex];
  }

  public addChatMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
    if (this.chatMessages.length > 50) {
      this.chatMessages.shift();
    }
    this.notifyChange();
  }

  public getState(): GameState {
    return {
      roomId: this.roomId,
      gameMode: this.gameMode,
      status: this.status,
      players: this.players,
      currentTurnIndex: this.currentTurnIndex,
      diceValue: this.diceValue,
      hasRolled: this.hasRolled,
      consecutiveSixes: this.consecutiveSixes,
      validTokenMoves: this.validTokenMoves,
      turnStartedAt: this.turnStartedAt,
      turnDuration: this.turnDuration,
      winner: this.winner,
      rankings: this.rankings,
      totalTurns: this.totalTurns,
      createdAt: this.createdAt,
      lastActionAt: this.lastActionAt,
      chatMessages: this.chatMessages,
      lastMove: this.lastMove,
    };
  }

  private createInitialTokens(color: PlayerColor): TokenState[] {
    return [0, 1, 2, 3].map((id) => ({
      id,
      stepCount: -1,
      position: getPositionKey(color, -1, id),
      isHome: false,
    }));
  }

  private clearTurnTimer(): void {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.aiActionTimeout) {
      clearTimeout(this.aiActionTimeout);
      this.aiActionTimeout = null;
    }
  }

  public cleanup(): void {
    this.clearTurnTimer();
  }

  private notifyChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
