import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { prayerService } from '../services/prayer.service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const prayerController = {
  /**
   * Get all prayer records for a month (query: ?month=YYYY-MM)
   */
  async getMonthlyRecords(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const month = (req.query.month as string) || currentMonth;

      const records = await prayerService.getRecordsForMonth(userId, month);
      sendSuccess(res, records, 'Records retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get today's prayer record
   */
  async getTodayRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const timezone = (req.headers['x-timezone'] as string) || 'UTC';
      const record = await prayerService.getTodayRecord(userId, timezone);
      sendSuccess(res, record, "Today's record retrieved");
    } catch (error) {
      next(error);
    }
  },

  /**
   * Save / update today's prayer record
   */
  async savePrayerRecord(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const timezone = (req.headers['x-timezone'] as string) || 'UTC';
      const { date, count, fajr, dhuhr, asr, maghrib, isha } = req.body;

      const updated = await prayerService.savePrayerRecord({
        userId,
        date,
        count,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
        userTimezone: timezone,
      });

      sendSuccess(res, updated, 'Prayer record updated successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        sendError(res, error.message, 400);
        return;
      }
      next(error);
    }
  },

  /**
   * Get monthly summary analytics
   */
  async getMonthlySummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const yearMonth = (req.query.month as string) || new Date().toISOString().substring(0, 7);

      const [year, month] = yearMonth.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      const summary = await prayerService.getMonthlySummary(userId, yearMonth, daysInMonth);
      sendSuccess(res, summary, 'Monthly summary calculated');
    } catch (error) {
      next(error);
    }
  },
};
