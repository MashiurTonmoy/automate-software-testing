import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserAuthPayload } from '../types/index.js';

export const signAccessToken = (payload: UserAuthPayload): string => {
  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const signRefreshToken = (payload: UserAuthPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): UserAuthPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as UserAuthPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): UserAuthPayload | null => {
  try {
    return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as UserAuthPayload;
  } catch {
    return null;
  }
};
