export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export interface TokenState {
  id: number; // 0, 1, 2, 3
  stepCount: number; // -1 = In Yard, 0 = Start cell, 1..50 = Main path, 51..55 = Home corridor, 56 = Center Home
  position: number | string; // Computed cell index or special key for UI
  isHome: boolean;
}

export interface Player {
  id: string; // Socket ID or User ID or 'ai_1', 'ai_2'
  userId?: string;
  username: string;
  avatar: string;
  color: PlayerColor;
  isAi?: boolean;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  isReady: boolean;
  isConnected: boolean;
  disconnectedAt?: number;
  tokens: TokenState[];
  rank?: number; // 1 for 1st place, 2 for 2nd, etc.
  hasWon: boolean;
}

export type GameMode = 'local' | 'private' | 'matchmaking' | 'ai';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor?: PlayerColor;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameState {
  roomId: string;
  gameMode: GameMode;
  status: GameStatus;
  players: Player[];
  currentTurnIndex: number;
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  validTokenMoves: number[]; // IDs of tokens that can move with current dice
  turnStartedAt: number;
  turnDuration: number; // e.g. 30 seconds
  winner: PlayerColor | null;
  rankings: PlayerColor[];
  totalTurns: number;
  createdAt: number;
  lastActionAt: number;
  chatMessages: ChatMessage[];
  lastMove?: {
    playerColor: PlayerColor;
    tokenId: number;
    fromStep: number;
    toStep: number;
    capturedColor?: PlayerColor;
    capturedTokenId?: number;
    isHome?: boolean;
  };
}

export interface UserStats {
  id: string;
  username: string;
  email: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
  winPercentage: number;
  currentRanking?: number;
  createdAt: string;
}

export interface GameHistoryItem {
  id: string;
  roomId: string;
  gameMode: GameMode;
  players: {
    userId?: string;
    username: string;
    avatar: string;
    color: PlayerColor;
    rank?: number;
    tokensHome: number;
  }[];
  winner: string;
  winnerColor: PlayerColor;
  durationSeconds: number;
  totalTurns: number;
  completedAt: string;
}
