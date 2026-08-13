import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { sounds } from '../services/audio';
import { socketService } from '../services/socket';
import { GameMode, GameState, PlayerColor } from '../types/game';
import { useAuth } from './AuthContext';

interface GameContextType {
  gameState: GameState | null;
  currentRoomId: string | null;
  isMatchmaking: boolean;
  matchmakingSeconds: number;
  isRolling: boolean;
  isLocalMode: boolean;
  errorMessage: string | null;
  activeTab: 'home' | 'lobby' | 'game' | 'leaderboard' | 'history' | 'profile' | 'rules';
  setActiveTab: (tab: 'home' | 'lobby' | 'game' | 'leaderboard' | 'history' | 'profile' | 'rules') => void;
  createPrivateRoom: (preferredColor?: PlayerColor) => void;
  joinPrivateRoom: (roomId: string) => void;
  joinRoom: (roomId: string) => void;
  createAiGame: (playerCount: 2 | 4, playerColor: PlayerColor, difficulty: 'easy' | 'medium' | 'hard') => void;
  startAiGame: (playerCount: 2 | 4, playerColor: PlayerColor, difficulty: 'easy' | 'medium' | 'hard') => void;
  createLocalGame: (players: { name: string; color: PlayerColor; avatar: string }[]) => void;
  startLocalGame: (players: { name: string; color: PlayerColor; avatar: string }[]) => void;
  toggleReady: () => void;
  startGame: () => void;
  rollDice: () => void;
  moveToken: (tokenId: number) => void;
  sendChatMessage: (text: string) => void;
  findMatch: () => void;
  cancelMatchmaking: () => void;
  leaveGame: () => void;
  clearError: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchmakingSeconds, setMatchmakingSeconds] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'home' | 'lobby' | 'game' | 'leaderboard' | 'history' | 'profile' | 'rules'
  >('home');

  const mmTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevMoveRef = useRef<GameState['lastMove'] | undefined>(undefined);

  const toggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  useEffect(() => {
    const socket = socketService.getSocket();

    socket.on('sync_state', (state: GameState) => {
      setGameState(state);
      setCurrentRoomId(state.roomId);

      if (state.status === 'waiting') {
        setActiveTab('lobby');
      } else if (state.status === 'in_progress' || state.status === 'completed') {
        setActiveTab('game');
      }

      // Check audio events based on lastMove
      if (state.lastMove && state.lastMove !== prevMoveRef.current) {
        prevMoveRef.current = state.lastMove;
        if (state.lastMove.capturedColor) {
          sounds.playCapture();
        } else if (state.lastMove.isHome) {
          sounds.playTokenHome();
        } else {
          sounds.playTokenMove();
        }
      }

      if (state.status === 'completed' && state.winner) {
        sounds.playVictory();
      }
    });

    socket.on('room_created', ({ roomId }) => {
      setCurrentRoomId(roomId);
      setActiveTab('lobby');
    });

    socket.on('joined_room', ({ roomId }) => {
      setCurrentRoomId(roomId);
      setActiveTab('lobby');
    });

    socket.on('game_started', ({ roomId }) => {
      setCurrentRoomId(roomId);
      setActiveTab('game');
    });

    socket.on('matchmaking_status', (data: { inQueue: boolean }) => {
      setIsMatchmaking(data.inQueue);
      if (data.inQueue) {
        setMatchmakingSeconds(0);
        if (mmTimerRef.current) clearInterval(mmTimerRef.current);
        mmTimerRef.current = setInterval(() => {
          setMatchmakingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        if (mmTimerRef.current) clearInterval(mmTimerRef.current);
      }
    });

    socket.on('match_found', ({ roomId }) => {
      setIsMatchmaking(false);
      if (mmTimerRef.current) clearInterval(mmTimerRef.current);
      setCurrentRoomId(roomId);
      setActiveTab('game');
    });

    socket.on('error_message', ({ message }) => {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    return () => {
      socket.off('sync_state');
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('game_started');
      socket.off('matchmaking_status');
      socket.off('match_found');
      socket.off('error_message');
    };
  }, []);

  const createPrivateRoom = (preferredColor?: PlayerColor) => {
    const socket = socketService.getSocket();
    socket.emit('create_room', {
      preferredColor,
      username: user?.username || 'Guest Player',
      avatar: user?.avatar || 'avatar-1',
    });
  };

  const joinPrivateRoom = (roomId: string) => {
    const socket = socketService.getSocket();
    socket.emit('join_room', {
      roomId,
      username: user?.username || 'Guest Player',
      avatar: user?.avatar || 'avatar-1',
    });
  };

  const createAiGame = (playerCount: 2 | 4, playerColor: PlayerColor, difficulty: 'easy' | 'medium' | 'hard') => {
    const socket = socketService.getSocket();
    socket.emit('create_ai_game', {
      playerCount,
      playerColor,
      difficulty,
      username: user?.username || 'Player',
      avatar: user?.avatar || 'avatar-1',
    });
  };

  const createLocalGame = (players: { name: string; color: PlayerColor; avatar: string }[]) => {
    const socket = socketService.getSocket();
    socket.emit('create_local_game', { players });
  };

  const toggleReady = () => {
    const socket = socketService.getSocket();
    socket.emit('toggle_ready');
  };

  const startGame = () => {
    const socket = socketService.getSocket();
    socket.emit('start_game');
  };

  const rollDice = () => {
    setIsRolling(true);
    sounds.playDiceRoll();
    const socket = socketService.getSocket();
    socket.emit('roll_dice');
    setTimeout(() => {
      setIsRolling(false);
    }, 600);
  };

  const moveToken = (tokenId: number) => {
    const socket = socketService.getSocket();
    socket.emit('move_token', { tokenId });
  };

  const sendChatMessage = (text: string) => {
    const socket = socketService.getSocket();
    socket.emit('send_chat', { text });
  };

  const findMatch = () => {
    const socket = socketService.getSocket();
    socket.emit('find_match', {
      username: user?.username || 'Guest Challenger',
      avatar: user?.avatar || 'avatar-1',
    });
  };

  const cancelMatchmaking = () => {
    const socket = socketService.getSocket();
    socket.emit('cancel_matchmaking');
    setIsMatchmaking(false);
    if (mmTimerRef.current) clearInterval(mmTimerRef.current);
  };

  const leaveGame = () => {
    const socket = socketService.getSocket();
    socket.emit('leave_room');
    setGameState(null);
    setCurrentRoomId(null);
    setActiveTab('home');
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  const isLocalMode = gameState?.gameMode === 'local';

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentRoomId,
        isMatchmaking,
        matchmakingSeconds,
        isRolling,
        isLocalMode,
        errorMessage,
        activeTab,
        setActiveTab,
        createPrivateRoom,
        joinPrivateRoom,
        joinRoom: joinPrivateRoom,
        createAiGame,
        startAiGame: createAiGame,
        createLocalGame,
        startLocalGame: createLocalGame,
        toggleReady,
        startGame,
        rollDice,
        moveToken,
        sendChatMessage,
        findMatch,
        cancelMatchmaking,
        leaveGame,
        clearError,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export function useGame(): GameContextType {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return ctx;
}
