import jwt, { SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateTokens = (payload: TokenPayload) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured');
  }

  const accessOptions: any = {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  };

  const refreshOptions: any = {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, accessOptions);
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, refreshOptions);

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as TokenPayload;
};

export const setCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};