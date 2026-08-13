import { Router } from 'express';
import {
  changePassword,
  getMe,
  login,
  register,
  updateProfile,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.put('/profile', authenticateToken as any, updateProfile as any);
router.post('/change-password', authenticateToken as any, changePassword as any);

export default router;
