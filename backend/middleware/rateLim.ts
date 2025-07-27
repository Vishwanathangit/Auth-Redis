import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 60;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const redisKey = `rate:${ip}`;

    const attempts = parseInt((await redisClient.get(redisKey)) || '0');

    if (attempts >= MAX_ATTEMPTS) {
      const ttl = await redisClient.ttl(redisKey);
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${ttl > 0 ? ttl : BLOCK_DURATION} seconds.`,
      });
    }

    next();
  } catch (err) {
    console.error('Rate limiter error:', err);
    return res.status(500).json({ message: 'Rate limiting failed' });
  }
};

export const incrementFailedAttempts = async (ip: string) => {
  try {
    const redisKey = `rate:${ip}`;
    await redisClient.incr(redisKey);
    await redisClient.expire(redisKey, BLOCK_DURATION);
  } catch (err) {
    console.error('Failed to increment attempts:', err);
  }
};

export const resetFailedAttempts = async (ip: string) => {
  try {
    const redisKey = `rate:${ip}`;
    await redisClient.del(redisKey);
  } catch (err) {
    console.error('Failed to reset attempts:', err);
  }
};