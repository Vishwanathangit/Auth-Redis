import type { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { verifyToken as verifyJWTToken, type TokenPayload } from '../utils/tokenUtils';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const sessionData = await redisClient.get(`session:${token}`);
    
    if (!sessionData) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const decoded = verifyJWTToken(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};