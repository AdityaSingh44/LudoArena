import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { GameHistoryItem, UserStats } from '../../../src/types/game';
import { GameHistoryModel } from '../models/GameHistory';
import { UserModel } from '../models/User';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalScore: number;
  winPercentage: number;
  currentRanking?: number;
  createdAt: string;
}

class StorageManager {
  private isMongoConnected: boolean = false;
  private users: Map<string, UserRecord> = new Map();
  private gameHistories: GameHistoryItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  public setMongoConnected(connected: boolean) {
    this.isMongoConnected = connected;
  }

  private async seedInitialData() {
    const defaultPassword = await bcrypt.hash('ludo1234', 10);
    const demoUsers: Partial<UserRecord>[] = [
      {
        id: 'usr_rahul',
        username: 'Rahul_Champ',
        email: 'rahul@example.com',
        avatar: 'avatar-1',
        gamesPlayed: 120,
        gamesWon: 92,
        gamesLost: 28,
        totalScore: 4850,
        winPercentage: 76.7,
        currentRanking: 1,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'usr_aditya',
        username: 'Aditya_Pro',
        email: 'aditya@example.com',
        avatar: 'avatar-2',
        gamesPlayed: 110,
        gamesWon: 87,
        gamesLost: 23,
        totalScore: 4620,
        winPercentage: 79.1,
        currentRanking: 2,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
      },
      {
        id: 'usr_aman',
        username: 'Aman_Master',
        email: 'aman@example.com',
        avatar: 'avatar-3',
        gamesPlayed: 105,
        gamesWon: 81,
        gamesLost: 24,
        totalScore: 4350,
        winPercentage: 77.1,
        currentRanking: 3,
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        id: 'usr_sneha',
        username: 'Sneha_Dice',
        email: 'sneha@example.com',
        avatar: 'avatar-4',
        gamesPlayed: 85,
        gamesWon: 62,
        gamesLost: 23,
        totalScore: 3650,
        winPercentage: 72.9,
        currentRanking: 4,
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        id: 'usr_vikram',
        username: 'Vikram_King',
        email: 'vikram@example.com',
        avatar: 'avatar-5',
        gamesPlayed: 74,
        gamesWon: 51,
        gamesLost: 23,
        totalScore: 3100,
        winPercentage: 68.9,
        currentRanking: 5,
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ];

    for (const u of demoUsers) {
      this.users.set(u.id!, {
        id: u.id!,
        username: u.username!,
        email: u.email!,
        passwordHash: defaultPassword,
        avatar: u.avatar!,
        gamesPlayed: u.gamesPlayed!,
        gamesWon: u.gamesWon!,
        gamesLost: u.gamesLost!,
        totalScore: u.totalScore!,
        winPercentage: u.winPercentage!,
        currentRanking: u.currentRanking,
        createdAt: u.createdAt!,
      });
    }
  }

  public async findUserByEmail(email: string): Promise<UserRecord | null> {
    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await (UserModel as any).findOne({ email: email.toLowerCase() });
        if (doc) {
          return {
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            avatar: doc.avatar,
            gamesPlayed: doc.gamesPlayed,
            gamesWon: doc.gamesWon,
            gamesLost: doc.gamesLost,
            totalScore: doc.totalScore,
            winPercentage: doc.winPercentage,
            currentRanking: doc.currentRanking,
            createdAt: doc.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB query error, falling back to memory store', err);
      }
    }

    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async findUserByUsername(username: string): Promise<UserRecord | null> {
    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await (UserModel as any).findOne({ username });
        if (doc) {
          return {
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            avatar: doc.avatar,
            gamesPlayed: doc.gamesPlayed,
            gamesWon: doc.gamesWon,
            gamesLost: doc.gamesLost,
            totalScore: doc.totalScore,
            winPercentage: doc.winPercentage,
            currentRanking: doc.currentRanking,
            createdAt: doc.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB query error, fallback to memory', err);
      }
    }

    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async findUserById(id: string): Promise<UserRecord | null> {
    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await (UserModel as any).findById(id);
        if (doc) {
          return {
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            passwordHash: doc.passwordHash,
            avatar: doc.avatar,
            gamesPlayed: doc.gamesPlayed,
            gamesWon: doc.gamesWon,
            gamesLost: doc.gamesLost,
            totalScore: doc.totalScore,
            winPercentage: doc.winPercentage,
            currentRanking: doc.currentRanking,
            createdAt: doc.createdAt.toISOString(),
          };
        }
      } catch (err) {
        console.warn('MongoDB query error, fallback to memory', err);
      }
    }

    return this.users.get(id) || null;
  }

  public async createUser(userData: {
    username: string;
    email: string;
    passwordHash: string;
    avatar?: string;
  }): Promise<UserRecord> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record: UserRecord = {
      id,
      username: userData.username,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      avatar: userData.avatar || 'avatar-1',
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalScore: 1000,
      winPercentage: 0,
      currentRanking: this.users.size + 1,
      createdAt: new Date().toISOString(),
    };

    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await (UserModel as any).create({
          username: record.username,
          email: record.email,
          passwordHash: record.passwordHash,
          avatar: record.avatar,
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          totalScore: 1000,
          winPercentage: 0,
        });
        record.id = doc._id.toString();
      } catch (err) {
        console.warn('MongoDB insert error, saving in memory', err);
      }
    }

    this.users.set(record.id, record);
    return record;
  }

  public async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    const user = await this.findUserById(id);
    if (!user) return null;

    const updated = { ...user, ...updates };

    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        await (UserModel as any).findByIdAndUpdate(id, updates);
      } catch (err) {
        console.warn('MongoDB update error', err);
      }
    }

    this.users.set(id, updated);
    return updated;
  }

  public async recordGameResult(
    gameHistory: Omit<GameHistoryItem, 'id'>,
    participants: { userId?: string; won: boolean; scoreDelta: number }[]
  ): Promise<GameHistoryItem> {
    const historyId = `gh_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const fullHistory: GameHistoryItem = {
      ...gameHistory,
      id: historyId,
    };

    this.gameHistories.unshift(fullHistory);

    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const doc = await (GameHistoryModel as any).create(gameHistory);
        fullHistory.id = doc._id.toString();
      } catch (err) {
        console.warn('MongoDB game history insert error', err);
      }
    }

    // Update participants' stats
    for (const p of participants) {
      if (!p.userId) continue;
      const user = await this.findUserById(p.userId);
      if (user) {
        const gamesPlayed = user.gamesPlayed + 1;
        const gamesWon = user.gamesWon + (p.won ? 1 : 0);
        const gamesLost = user.gamesLost + (p.won ? 0 : 1);
        const totalScore = Math.max(0, user.totalScore + p.scoreDelta);
        const winPercentage = parseFloat(((gamesWon / gamesPlayed) * 100).toFixed(1));

        await this.updateUser(user.id, {
          gamesPlayed,
          gamesWon,
          gamesLost,
          totalScore,
          winPercentage,
        });
      }
    }

    return fullHistory;
  }

  public async getLeaderboard(limit = 50): Promise<UserStats[]> {
    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const docs = await (UserModel as any).find().sort({ totalScore: -1, gamesWon: -1 }).limit(limit);
        return docs.map((doc: any, idx: number) => ({
          id: doc._id.toString(),
          username: doc.username,
          email: doc.email,
          avatar: doc.avatar,
          gamesPlayed: doc.gamesPlayed,
          gamesWon: doc.gamesWon,
          gamesLost: doc.gamesLost,
          totalScore: doc.totalScore,
          winPercentage: doc.winPercentage,
          currentRanking: idx + 1,
          createdAt: doc.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn('MongoDB leaderboard query error, using memory store', err);
      }
    }

    const sorted = Array.from(this.users.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.gamesWon - a.gamesWon;
    });

    return sorted.slice(0, limit).map((u, idx) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      avatar: u.avatar,
      gamesPlayed: u.gamesPlayed,
      gamesWon: u.gamesWon,
      gamesLost: u.gamesLost,
      totalScore: u.totalScore,
      winPercentage: u.winPercentage,
      currentRanking: idx + 1,
      createdAt: u.createdAt,
    }));
  }

  public async getGameHistories(userId?: string, limit = 20): Promise<GameHistoryItem[]> {
    if (this.isMongoConnected && mongoose.connection.readyState === 1) {
      try {
        const query = userId ? { 'players.userId': userId } : {};
        const docs = await (GameHistoryModel as any).find(query).sort({ completedAt: -1 }).limit(limit);
        return docs.map((doc: any) => ({
          id: doc._id.toString(),
          roomId: doc.roomId,
          gameMode: doc.gameMode as any,
          players: doc.players,
          winner: doc.winner,
          winnerColor: doc.winnerColor as any,
          durationSeconds: doc.durationSeconds,
          totalTurns: doc.totalTurns,
          completedAt: doc.completedAt.toISOString(),
        }));
      } catch (err) {
        console.warn('MongoDB game histories error', err);
      }
    }

    if (userId) {
      return this.gameHistories
        .filter((h) => h.players.some((p) => p.userId === userId))
        .slice(0, limit);
    }
    return this.gameHistories.slice(0, limit);
  }
}

export const storage = new StorageManager();
