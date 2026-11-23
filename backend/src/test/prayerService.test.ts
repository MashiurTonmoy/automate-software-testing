import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prayerService } from '../services/prayer.service.js';
import { prisma } from '../config/db.js';

vi.mock('../config/db.js', () => ({
  prisma: {
    prayerRecord: {
      upsert: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('Prayer Service Business Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodayString', () => {
    it('returns a valid YYYY-MM-DD date string', () => {
      const today = prayerService.getTodayString('UTC');
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('savePrayerRecord Date Restrictions', () => {
    it('rejects future dates with an error', async () => {
      const futureDate = '2099-01-01';
      await expect(
        prayerService.savePrayerRecord({
          userId: 'user-1',
          date: futureDate,
          count: 3,
        })
      ).rejects.toThrow('Future dates are strictly disabled');
    });

    it('rejects past dates with an error', async () => {
      const pastDate = '2020-01-01';
      await expect(
        prayerService.savePrayerRecord({
          userId: 'user-1',
          date: pastDate,
          count: 3,
        })
      ).rejects.toThrow('Past dates are strictly read-only');
    });

    it('correctly calculates count from individual prayer booleans', async () => {
      const today = prayerService.getTodayString('UTC');

      (prisma.prayerRecord.upsert as any).mockResolvedValue({
        id: 'rec-1',
        userId: 'user-1',
        date: today,
        count: 3,
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: false,
        isha: false,
      });

      const result = await prayerService.savePrayerRecord({
        userId: 'user-1',
        date: today,
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: false,
        isha: false,
        userTimezone: 'UTC',
      });

      expect(prisma.prayerRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            count: 3,
            fajr: true,
            dhuhr: true,
            asr: true,
            maghrib: false,
            isha: false,
          }),
        })
      );
      expect(result.count).toBe(3);
    });
  });

  describe('getMonthlySummary', () => {
    it('calculates correct summary stats', async () => {
      (prisma.prayerRecord.findMany as any).mockResolvedValue([
        { count: 5 },
        { count: 3 },
        { count: 5 },
        { count: 0 },
      ]);

      const summary = await prayerService.getMonthlySummary('user-1', '2026-11', 30);

      expect(summary.totalPrayers).toBe(13); // 5 + 3 + 5 + 0
      expect(summary.maxPossiblePrayers).toBe(150); // 30 * 5
      expect(summary.recordedDays).toBe(3); // > 0 count
      expect(summary.perfectDays).toBe(2); // count === 5
      expect(summary.averagePerDay).toBe(4.3); // 13 / 3 = 4.3333 -> 4.3
    });

    it('handles empty records cleanly', async () => {
      (prisma.prayerRecord.findMany as any).mockResolvedValue([]);

      const summary = await prayerService.getMonthlySummary('user-1', '2026-11', 30);

      expect(summary.totalPrayers).toBe(0);
      expect(summary.recordedDays).toBe(0);
      expect(summary.perfectDays).toBe(0);
      expect(summary.averagePerDay).toBe(0);
    });
  });
});
