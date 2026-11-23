import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { UserAuthPayload } from '../types/index.js';

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  timezone?: string;
}

export interface LoginDTO {
  identifier: string; // username or email
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    username: string;
    email: string;
    timezone: string;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async register(data: RegisterDTO): Promise<AuthResult> {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    // Check for existing username or email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existing) {
      if (existing.username === cleanUsername) {
        throw new Error('Username is already taken');
      }
      throw new Error('Email is already registered');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        timezone: data.timezone || 'UTC',
      },
    });

    const payload: UserAuthPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token with 7-day expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async login(data: LoginDTO): Promise<AuthResult> {
    const cleanIdentifier = data.identifier.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const payload: UserAuthPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Save refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        timezone: user.timezone,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      }
      throw new Error('Refresh token revoked or expired');
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: savedToken.id } });

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    });
    const newRefreshToken = signRefreshToken({
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: payload.userId,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } catch {
      // Ignore if token was already deleted
    }
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        timezone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },
};
