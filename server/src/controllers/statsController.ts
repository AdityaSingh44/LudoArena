import { Request, Response } from 'express';
import { storage } from '../db/storage.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const leaderboard = await storage.getLeaderboard(limit);
    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

export async function getGameHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const history = await storage.getGameHistories(userId, limit);
    return res.status(200).json({ history });
  } catch (error) {
    console.error('getGameHistory error:', error);
    return res.status(500).json({ error: 'Failed to fetch game history' });
  }
}

export async function getUserProfileStats(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const user = await storage.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { passwordHash: _, ...safeUser } = user;
    const recentGames = await storage.getGameHistories(userId, 5);

    return res.status(200).json({
      player: safeUser,
      recentGames,
    });
  } catch (error) {
    console.error('getUserProfileStats error:', error);
    return res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
}
