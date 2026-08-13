import { Router } from 'express';
import {
  getGameHistory,
  getLeaderboard,
  getUserProfileStats,
} from '../controllers/statsController.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);
router.get('/history', optionalAuthenticateToken as any, getGameHistory as any);
router.get('/user/:userId', getUserProfileStats);

export default router;
