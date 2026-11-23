import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/auth.service.js';
import { prisma } from '../config/db.js';
import bcrypt from 'bcryptjs';

vi.mock('../config/db.js', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password_123'),
    compare: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('successfully registers a new user with hashed password', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'user-uuid-1',
        username: 'muslim_brother',
        email: 'brother@example.com',
        timezone: 'UTC',
        createdAt: new Date(),
      });
      (prisma.refreshToken.create as any).mockResolvedValue({});

      const result = await authService.register({
        username: 'muslim_brother',
        email: 'brother@example.com',
        password: 'Password123!',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(result.user.username).toBe('muslim_brother');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('throws error if username already exists', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 'existing-1',
        username: 'taken_user',
        email: 'other@example.com',
      });

      await expect(
        authService.register({
          username: 'taken_user',
          email: 'unique@example.com',
          password: 'Password123!',
        })
      ).rejects.toThrow('Username is already taken');
    });
  });

  describe('login', () => {
    it('throws error for non-existent user', async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      await expect(
        authService.login({
          identifier: 'nonexistent',
          password: 'password',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws error for invalid password', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 'user-1',
        username: 'user1',
        email: 'user1@example.com',
        passwordHash: 'hashed_pw',
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        authService.login({
          identifier: 'user1',
          password: 'wrong_password',
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('returns tokens on valid credentials', async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 'user-1',
        username: 'user1',
        email: 'user1@example.com',
        passwordHash: 'hashed_pw',
        timezone: 'Asia/Dhaka',
        createdAt: new Date(),
      });
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.refreshToken.create as any).mockResolvedValue({});

      const result = await authService.login({
        identifier: 'user1',
        password: 'correct_password',
      });

      expect(result.user.id).toBe('user-1');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});
