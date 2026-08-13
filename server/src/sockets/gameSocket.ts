import { Server, Socket } from 'socket.io';
import {
  ChatMessage,
  GameMode,
  Player,
  PlayerColor,
} from '../../../src/types/game';
import { storage } from '../db/storage.js';
import { COLORS } from '../game/constants.js';
import { LudoGame } from '../game/ludoGame.js';
import { verifyToken } from '../utils/jwt.js';

interface MatchmakingCandidate {
  socketId: string;
  userId?: string;
  username: string;
  avatar: string;
  joinedAt: number;
}

export class GameSocketServer {
  private io: Server;
  private games: Map<string, LudoGame> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private socketToUser: Map<string, { userId?: string; username: string; avatar: string }> = new Map();
  private matchmakingQueue: MatchmakingCandidate[] = [];
  private matchmakingInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.setupSocketEvents();
    this.startMatchmakingLoop();
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private setupSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      // Optional token auth on handshake
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          this.socketToUser.set(socket.id, {
            userId: decoded.userId,
            username: decoded.username,
            avatar: 'avatar-1',
          });
        }
      }

      // Handle user identification
      socket.on('set_user', (data: { userId?: string; username: string; avatar: string }) => {
        this.socketToUser.set(socket.id, {
          userId: data.userId,
          username: data.username || 'Player',
          avatar: data.avatar || 'avatar-1',
        });
      });

      // 1. Create Private Room
      socket.on('create_room', (data: { preferredColor?: PlayerColor; username?: string; avatar?: string }) => {
        const roomId = this.generateRoomCode();
        const userInfo = this.socketToUser.get(socket.id) || {
          username: data.username || 'Host',
          avatar: data.avatar || 'avatar-1',
        };

        const chosenColor = data.preferredColor && COLORS.includes(data.preferredColor) ? data.preferredColor : 'red';

        const game = new LudoGame(
          roomId,
          'private',
          (updatedGame) => this.broadcastGameState(updatedGame),
          (updatedGame) => this.broadcastGameState(updatedGame)
        );

        const hostPlayer: Player = {
          id: socket.id,
          userId: userInfo.userId,
          username: userInfo.username,
          avatar: userInfo.avatar,
          color: chosenColor,
          isReady: true,
          isConnected: true,
          tokens: [],
          hasWon: false,
        };

        game.addPlayer(hostPlayer);
        this.games.set(roomId, game);
        this.socketToRoom.set(socket.id, roomId);

        socket.join(`game:${roomId}`);
        socket.emit('room_created', { roomId });
        this.broadcastGameState(game);
      });

      // 2. Join Private Room
      socket.on('join_room', (data: { roomId: string; username?: string; avatar?: string }) => {
        const roomId = data.roomId?.toUpperCase()?.trim();
        const game = this.games.get(roomId);

        if (!game) {
          socket.emit('error_message', { message: 'Game room not found. Please verify the room code.' });
          return;
        }

        const userInfo = this.socketToUser.get(socket.id) || {
          username: data.username || `Player_${socket.id.substring(0, 4)}`,
          avatar: data.avatar || 'avatar-2',
        };

        // Check if reconnecting existing player
        const existingPlayer = game.players.find(
          (p) => (userInfo.userId && p.userId === userInfo.userId) || p.username === userInfo.username
        );

        if (existingPlayer) {
          existingPlayer.id = socket.id;
          existingPlayer.isConnected = true;
          this.socketToRoom.set(socket.id, roomId);
          socket.join(`game:${roomId}`);
          this.broadcastGameState(game);
          socket.emit('joined_room', { roomId, color: existingPlayer.color });
          return;
        }

        if (game.status !== 'waiting') {
          socket.emit('error_message', { message: 'This game has already started.' });
          return;
        }

        if (game.players.length >= 4) {
          socket.emit('error_message', { message: 'This game room is already full (max 4 players).' });
          return;
        }

        // Pick next unused color
        const usedColors = game.players.map((p) => p.color);
        const availableColor = COLORS.find((c) => !usedColors.includes(c)) || 'blue';

        const newPlayer: Player = {
          id: socket.id,
          userId: userInfo.userId,
          username: userInfo.username,
          avatar: userInfo.avatar,
          color: availableColor,
          isReady: false,
          isConnected: true,
          tokens: [],
          hasWon: false,
        };

        game.addPlayer(newPlayer);
        this.socketToRoom.set(socket.id, roomId);
        socket.join(`game:${roomId}`);

        socket.emit('joined_room', { roomId, color: availableColor });
        this.broadcastGameState(game);
      });

      // 3. Create AI Game
      socket.on(
        'create_ai_game',
        (data: {
          playerCount: 2 | 4;
          playerColor: PlayerColor;
          difficulty: 'easy' | 'medium' | 'hard';
          username?: string;
          avatar?: string;
        }) => {
          const roomId = `AI_${this.generateRoomCode()}`;
          const userInfo = this.socketToUser.get(socket.id) || {
            username: data.username || 'Hero Player',
            avatar: data.avatar || 'avatar-1',
          };

          const game = new LudoGame(
            roomId,
            'ai',
            (updatedGame) => this.broadcastGameState(updatedGame),
            (updatedGame) => this.broadcastGameState(updatedGame)
          );

          const humanColor = data.playerColor || 'red';
          const humanPlayer: Player = {
            id: socket.id,
            userId: userInfo.userId,
            username: userInfo.username,
            avatar: userInfo.avatar,
            color: humanColor,
            isReady: true,
            isConnected: true,
            tokens: [],
            hasWon: false,
          };
          game.addPlayer(humanPlayer);

          const aiNames = [
            { name: 'AI Dexter', avatar: 'avatar-ai-1' },
            { name: 'AI Nova', avatar: 'avatar-ai-2' },
            { name: 'AI Vega', avatar: 'avatar-ai-3' },
          ];

          // Determine AI colors
          let aiColors: PlayerColor[] = [];
          if (data.playerCount === 2) {
            // Opposite corner for 2 players
            const opposites: Record<PlayerColor, PlayerColor> = {
              red: 'yellow',
              yellow: 'red',
              green: 'blue',
              blue: 'green',
            };
            aiColors = [opposites[humanColor]];
          } else {
            aiColors = COLORS.filter((c) => c !== humanColor);
          }

          aiColors.forEach((color, idx) => {
            const aiData = aiNames[idx % aiNames.length];
            const aiPlayer: Player = {
              id: `ai_${color}_${idx}`,
              username: aiData.name,
              avatar: aiData.avatar,
              color,
              isAi: true,
              aiDifficulty: data.difficulty || 'medium',
              isReady: true,
              isConnected: true,
              tokens: [],
              hasWon: false,
            };
            game.addPlayer(aiPlayer);
          });

          this.games.set(roomId, game);
          this.socketToRoom.set(socket.id, roomId);
          socket.join(`game:${roomId}`);

          game.startGame();
          socket.emit('game_started', { roomId });
          this.broadcastGameState(game);
        }
      );

      // 4. Create Local Pass-and-Play Game
      socket.on(
        'create_local_game',
        (data: {
          players: { name: string; color: PlayerColor; avatar: string }[];
        }) => {
          const roomId = `LOCAL_${this.generateRoomCode()}`;
          const game = new LudoGame(
            roomId,
            'local',
            (updatedGame) => this.broadcastGameState(updatedGame),
            (updatedGame) => this.broadcastGameState(updatedGame)
          );

          data.players.forEach((p, idx) => {
            game.addPlayer({
              id: `local_player_${idx}`,
              username: p.name || `Player ${idx + 1}`,
              avatar: p.avatar || `avatar-${idx + 1}`,
              color: p.color,
              isReady: true,
              isConnected: true,
              tokens: [],
              hasWon: false,
            });
          });

          this.games.set(roomId, game);
          this.socketToRoom.set(socket.id, roomId);
          socket.join(`game:${roomId}`);

          game.startGame();
          socket.emit('game_started', { roomId });
          this.broadcastGameState(game);
        }
      );

      // 5. Toggle Ready in Lobby
      socket.on('toggle_ready', () => {
        const roomId = this.socketToRoom.get(socket.id);
        if (!roomId) return;
        const game = this.games.get(roomId);
        if (!game) return;

        const player = game.players.find((p) => p.id === socket.id);
        if (player) {
          game.setPlayerReady(socket.id, !player.isReady);
        }
      });

      // 6. Start Game from Lobby
      socket.on('start_game', () => {
        const roomId = this.socketToRoom.get(socket.id);
        if (!roomId) return;
        const game = this.games.get(roomId);
        if (!game) return;

        // Verify host is requesting start
        if (game.players[0]?.id !== socket.id) {
          socket.emit('error_message', { message: 'Only the room creator can start the game.' });
          return;
        }

        if (game.players.length < 2) {
          socket.emit('error_message', { message: 'Need at least 2 players to start the game.' });
          return;
        }

        const success = game.startGame();
        if (success) {
          this.io.to(`game:${roomId}`).emit('game_started', { roomId });
          this.broadcastGameState(game);
        }
      });

      // 7. Roll Dice
      socket.on('roll_dice', () => {
        const roomId = this.socketToRoom.get(socket.id);
        if (!roomId) return;
        const game = this.games.get(roomId);
        if (!game || game.status !== 'in_progress') return;

        // In local mode, accept roll from any connected client for the active player
        const playerId = game.gameMode === 'local' ? game.getCurrentPlayer()?.id || socket.id : socket.id;

        const result = game.rollDice(playerId);
        if (!result.success) {
          socket.emit('error_message', { message: result.error });
        }
      });

      // 8. Move Token
      socket.on('move_token', (data: { tokenId: number }) => {
        const roomId = this.socketToRoom.get(socket.id);
        if (!roomId) return;
        const game = this.games.get(roomId);
        if (!game || game.status !== 'in_progress') return;

        const playerId = game.gameMode === 'local' ? game.getCurrentPlayer()?.id || socket.id : socket.id;

        const result = game.moveToken(playerId, data.tokenId);
        if (!result.success) {
          socket.emit('error_message', { message: result.error });
        }
      });

      // 9. Send In-Game Chat / Emote
      socket.on('send_chat', (data: { text: string }) => {
        const roomId = this.socketToRoom.get(socket.id);
        if (!roomId || !data.text) return;
        const game = this.games.get(roomId);
        if (!game) return;

        const player = game.players.find((p) => p.id === socket.id);
        const senderName = player ? player.username : 'Spectator';
        const senderColor = player?.color;

        const message: ChatMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          senderId: socket.id,
          senderName,
          senderColor,
          text: data.text.substring(0, 100),
          timestamp: Date.now(),
        };

        game.addChatMessage(message);
      });

      // 10. Matchmaking Queue
      socket.on('find_match', (data: { username?: string; avatar?: string }) => {
        const userInfo = this.socketToUser.get(socket.id) || {
          username: data.username || `Player_${socket.id.substring(0, 4)}`,
          avatar: data.avatar || 'avatar-1',
        };

        // Remove if already in queue
        this.matchmakingQueue = this.matchmakingQueue.filter((c) => c.socketId !== socket.id);

        this.matchmakingQueue.push({
          socketId: socket.id,
          userId: userInfo.userId,
          username: userInfo.username,
          avatar: userInfo.avatar,
          joinedAt: Date.now(),
        });

        socket.emit('matchmaking_status', { inQueue: true, queueSize: this.matchmakingQueue.length });
      });

      socket.on('cancel_matchmaking', () => {
        this.matchmakingQueue = this.matchmakingQueue.filter((c) => c.socketId !== socket.id);
        socket.emit('matchmaking_status', { inQueue: false });
      });

      // 11. Leave Room
      socket.on('leave_room', () => {
        this.handlePlayerLeave(socket);
      });

      // 12. Disconnect
      socket.on('disconnect', () => {
        this.matchmakingQueue = this.matchmakingQueue.filter((c) => c.socketId !== socket.id);
        this.handlePlayerLeave(socket);
      });
    });
  }

  private handlePlayerLeave(socket: Socket): void {
    const roomId = this.socketToRoom.get(socket.id);
    if (!roomId) return;

    const game = this.games.get(roomId);
    if (!game) return;

    game.removePlayer(socket.id);
    this.socketToRoom.delete(socket.id);
    socket.leave(`game:${roomId}`);

    // If room is empty, clean up after brief retention
    const connectedPlayers = game.players.filter((p) => p.isConnected && !p.isAi);
    if (connectedPlayers.length === 0 && game.gameMode !== 'local') {
      setTimeout(() => {
        const fresh = this.games.get(roomId);
        if (fresh && fresh.players.filter((p) => p.isConnected && !p.isAi).length === 0) {
          fresh.cleanup();
          this.games.delete(roomId);
        }
      }, 60000);
    }
  }

  private broadcastGameState(game: LudoGame): void {
    const state = game.getState();
    this.io.to(`game:${game.roomId}`).emit('sync_state', state);

    // If game just completed, persist history
    if (game.status === 'completed') {
      this.persistCompletedGame(game);
    }
  }

  private async persistCompletedGame(game: LudoGame): Promise<void> {
    try {
      const winnerPlayer = game.players.find((p) => p.color === game.winner);
      const durationSeconds = Math.floor((Date.now() - game.createdAt) / 1000);

      const participants = game.players.map((p) => ({
        userId: p.userId,
        won: p.color === game.winner,
        scoreDelta: p.color === game.winner ? 50 : p.rank === 2 ? 20 : -15,
      }));

      await storage.recordGameResult(
        {
          roomId: game.roomId,
          gameMode: game.gameMode,
          players: game.players.map((p) => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            color: p.color,
            rank: p.rank,
            tokensHome: p.tokens.filter((t) => t.isHome).length,
          })),
          winner: winnerPlayer?.username || 'Unknown',
          winnerColor: game.winner || 'red',
          durationSeconds,
          totalTurns: game.totalTurns,
          completedAt: new Date().toISOString(),
        },
        participants
      );
    } catch (err) {
      console.warn('Error persisting game history:', err);
    }
  }

  private startMatchmakingLoop(): void {
    this.matchmakingInterval = setInterval(() => {
      // Pair 2 or 4 players from queue
      if (this.matchmakingQueue.length >= 2) {
        const count = this.matchmakingQueue.length >= 4 ? 4 : 2;
        const matched = this.matchmakingQueue.splice(0, count);

        const roomId = `MM_${this.generateRoomCode()}`;
        const game = new LudoGame(
          roomId,
          'matchmaking',
          (updatedGame) => this.broadcastGameState(updatedGame),
          (updatedGame) => this.broadcastGameState(updatedGame)
        );

        matched.forEach((candidate, idx) => {
          const socket = this.io.sockets.sockets.get(candidate.socketId);
          if (socket) {
            this.socketToRoom.set(candidate.socketId, roomId);
            socket.join(`game:${roomId}`);

            game.addPlayer({
              id: candidate.socketId,
              userId: candidate.userId,
              username: candidate.username,
              avatar: candidate.avatar,
              color: COLORS[idx],
              isReady: true,
              isConnected: true,
              tokens: [],
              hasWon: false,
            });
          }
        });

        this.games.set(roomId, game);
        game.startGame();

        this.io.to(`game:${roomId}`).emit('match_found', { roomId });
        this.broadcastGameState(game);
      }
    }, 2000);
  }
}
