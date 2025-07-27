import type { Request, Response } from 'express';
import { User } from '../models/User';
import { redisClient } from '../config/redis';
import { generateTokens, verifyToken as verifyJWTToken, setCookies, clearCookies, type TokenPayload } from '../utils/tokenUtils';
import { incrementFailedAttempts, resetFailedAttempts } from '../middleware/rateLim';
import type { AuthRequest } from '../middleware/authMiddleware';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const tokenPayload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    await redisClient.setEx(`session:${accessToken}`, 900, JSON.stringify(tokenPayload));
    await redisClient.setEx(`refresh:${refreshToken}`, 604800, JSON.stringify(tokenPayload));

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

    if (!email || !password) {
      await incrementFailedAttempts(ip);
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      await incrementFailedAttempts(ip);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await incrementFailedAttempts(ip);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    await resetFailedAttempts(ip);

    const tokenPayload: TokenPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    await redisClient.setEx(`session:${accessToken}`, 900, JSON.stringify(tokenPayload));
    await redisClient.setEx(`refresh:${refreshToken}`, 604800, JSON.stringify(tokenPayload));

    setCookies(res, accessToken, refreshToken);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (accessToken) {
      await redisClient.del(`session:${accessToken}`);
    }

    if (refreshToken) {
      await redisClient.del(`refresh:${refreshToken}`);
    }

    clearCookies(res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const sessionData = await redisClient.get(`refresh:${refreshToken}`);
    
    if (!sessionData) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const decoded = verifyJWTToken(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    
    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);

    await redisClient.del(`refresh:${refreshToken}`);
    await redisClient.setEx(`session:${accessToken}`, 900, JSON.stringify(tokenPayload));
    await redisClient.setEx(`refresh:${newRefreshToken}`, 604800, JSON.stringify(tokenPayload));

    setCookies(res, accessToken, newRefreshToken);

    res.json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};