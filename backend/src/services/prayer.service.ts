import { prisma } from '../config/db.js';
import { MonthlyStatsResponse, PrayerCount } from '../types/index.js';

export interface SavePrayerDTO {
  userId: string;
  date: string; // YYYY-MM-DD
  count?: number;
  fajr?: boolean;
  dhuhr?: boolean;
  asr?: boolean;
  maghrib?: boolean;
  isha?: boolean;
  userTimezone?: string;
}

export const prayerService = {
  /**
   * Helper to get current date formatted as YYYY-MM-DD in the given timezone
   */
  getTodayString(timezone = 'UTC'): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(now); // en-CA outputs YYYY-MM-DD
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  },

  /**
   * Upsert today's prayer record with strict date boundary checks
   */
  async savePrayerRecord(data: SavePrayerDTO) {
    const today = this.getTodayString(data.userTimezone || 'UTC');

    // Strict Date Restrictions:
    if (data.date > today) {
      throw new Error('Future dates are strictly disabled and cannot be recorded');
    }

    if (data.date < today) {
      throw new Error('Past dates are strictly read-only to preserve authentic history');
    }

    // Determine individual prayer states and prayer count
    const hasDetails =
      data.fajr !== undefined ||
      data.dhuhr !== undefined ||
      data.asr !== undefined ||
      data.maghrib !== undefined ||
      data.isha !== undefined;

    let fajr = data.fajr ?? false;
    let dhuhr = data.dhuhr ?? false;
    let asr = data.asr ?? false;
    let maghrib = data.maghrib ?? false;
    let isha = data.isha ?? false;
    let count: number;

    if (hasDetails) {
      // If individual prayers are passed, calculate count from checked prayers
      count = [fajr, dhuhr, asr, maghrib, isha].filter(Boolean).length;
    } else if (data.count !== undefined) {
      count = Math.min(Math.max(data.count, 0), 5);
      // Auto-assign chronological prayers if count is provided without flags
      fajr = count >= 1;
      dhuhr = count >= 2;
      asr = count >= 3;
      maghrib = count >= 4;
      isha = count >= 5;
    } else {
      count = 0;
    }

    // In-place Upsert: creates if not present, updates if already present today
    const record = await prisma.prayerRecord.upsert({
      where: {
        userId_date: {
          userId: data.userId,
          date: data.date,
        },
      },
      update: {
        count,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
      },
      create: {
        userId: data.userId,
        date: data.date,
        count,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
      },
    });

    return record;
  },

  /**
   * Get all prayer records for a specific user and month (YYYY-MM)
   */
  async getRecordsForMonth(userId: string, monthPrefix: string) {
    const records = await prisma.prayerRecord.findMany({
      where: {
        userId,
        date: {
          startsWith: monthPrefix,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Map by date string: { "2026-11-23": record }
    const recordsMap: Record<string, (typeof records)[0]> = {};
    for (const record of records) {
      recordsMap[record.date] = record;
    }

    return recordsMap;
  },

  /**
   * Get record for today
   */
  async getTodayRecord(userId: string, timezone = 'UTC') {
    const today = this.getTodayString(timezone);
    const record = await prisma.prayerRecord.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    return (
      record || {
        date: today,
        count: 0 as PrayerCount,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false,
        updatedAt: new Date(),
      }
    );
  },

  /**
   * Calculate monthly analytics & summary statistics
   */
  async getMonthlySummary(
    userId: string,
    yearMonth: string,
    daysInMonth: number
  ): Promise<MonthlyStatsResponse> {
    const records = await prisma.prayerRecord.findMany({
      where: {
        userId,
        date: {
          startsWith: yearMonth,
        },
      },
    });

    const totalPrayers = records.reduce((sum, r) => sum + r.count, 0);
    const maxPossiblePrayers = daysInMonth * 5;
    const recordedDays = records.filter((r) => r.count > 0).length;
    const perfectDays = records.filter((r) => r.count === 5).length;
    const averagePerDay =
      recordedDays > 0 ? parseFloat((totalPrayers / recordedDays).toFixed(1)) : 0;

    return {
      totalPrayers,
      maxPossiblePrayers,
      recordedDays,
      perfectDays,
      averagePerDay,
    };
  },
};
