import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';
import { ENV } from '../config/env.js';

const COOKIE_NAME = 'salat_refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === 'production',
  sameSite: (ENV.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, timezone } = req.body;
      const result = await authService.register({ username, email, password, timezone });

      res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken },
        'User registered successfully',
        201
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, error.message, 400);
        return;
      }
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await authService.login({ identifier, password });

      res.cookie(COOKIE_NAME, result.refreshToken, COOKIE_OPTIONS);
      sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken },
        'Logged in successfully'
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, error.message, 401);
        return;
      }
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (!token) {
        sendError(res, 'Refresh token required', 401);
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(token);
      res.cookie(COOKIE_NAME, newRefreshToken, COOKIE_OPTIONS);
      sendSuccess(res, { accessToken }, 'Access token refreshed successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, error.message, 401);
        return;
      }
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (token) {
        await authService.logout(token);
      }
      res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        sendError(res, 'Unauthorized', 401);
        return;
      }
      const profile = await authService.getProfile(req.user.userId);
      sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  },
};
