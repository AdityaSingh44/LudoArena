import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { storage } from '../db/storage.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateToken } from '../utils/jwt.js';

export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingEmail = await storage.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const existingUser = await storage.findUserByUsername(username.trim());
    if (existingUser) {
      return res.status(409).json({ error: 'This username is already taken. Please choose another.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await storage.createUser({
      username: username.trim(),
      email: email.trim(),
      passwordHash,
      avatar: avatar || 'avatar-1',
    });

    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });

    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during registration.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Please provide username/email and password.' });
    }

    let user = await storage.findUserByEmail(emailOrUsername);
    if (!user) {
      user = await storage.findUserByUsername(emailOrUsername);
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await storage.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ error: 'Server error retrieving profile' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { avatar, username } = req.body;
    const updates: Partial<{ avatar: string; username: string }> = {};

    if (avatar && typeof avatar === 'string') {
      updates.avatar = avatar;
    }

    if (username && typeof username === 'string') {
      const trimmed = username.trim();
      if (trimmed.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      }
      const existing = await storage.findUserByUsername(trimmed);
      if (existing && existing.id !== req.user.userId) {
        return res.status(409).json({ error: 'Username is already taken by another player.' });
      }
      updates.username = trimmed;
    }

    const updated = await storage.updateUser(req.user.userId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    return res.status(200).json({ message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ error: 'Server error updating profile' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await storage.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await storage.updateUser(user.id, { passwordHash: newHash });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ error: 'Server error changing password' });
  }
}
