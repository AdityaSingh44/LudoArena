import mongoose, { Document, Schema } from 'mongoose';

export interface IGameHistory extends Document {
  roomId: string;
  gameMode: string;
  players: {
    userId?: string;
    username: string;
    avatar: string;
    color: string;
    rank?: number;
    tokensHome: number;
  }[];
  winner: string;
  winnerColor: string;
  durationSeconds: number;
  totalTurns: number;
  completedAt: Date;
}

const GameHistorySchema: Schema = new Schema(
  {
    roomId: { type: String, required: true },
    gameMode: { type: String, required: true },
    players: [
      {
        userId: { type: String },
        username: { type: String, required: true },
        avatar: { type: String, default: 'avatar-1' },
        color: { type: String, required: true },
        rank: { type: Number },
        tokensHome: { type: Number, default: 0 },
      },
    ],
    winner: { type: String, required: true },
    winnerColor: { type: String, required: true },
    durationSeconds: { type: Number, default: 0 },
    totalTurns: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const GameHistoryModel: mongoose.Model<IGameHistory> =
  (mongoose.models.GameHistory as mongoose.Model<IGameHistory>) ||
  mongoose.model<IGameHistory>('GameHistory', GameHistorySchema);
