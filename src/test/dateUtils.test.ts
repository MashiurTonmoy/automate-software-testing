import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  parseDateKey,
  getDateCategory,
  getTodayKey,
  formatFriendlyDate,
  formatMonthYear,
  getCalendarGrid,
} from '../utils/dateUtils';

describe('dateUtils', () => {

  // ── formatDateKey ─────────────────────────────────────────────────
  describe('formatDateKey', () => {
    it('formats a local Date to YYYY-MM-DD without timezone shifts', () => {
      expect(formatDateKey(new Date(2026, 10, 4))).toBe('2026-11-04');
    });

    it('pads single-digit month and day with leading zero', () => {
      expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('handles end of year correctly', () => {
      expect(formatDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
    });

    it('handles leap year Feb 29 correctly', () => {
      expect(formatDateKey(new Date(2024, 1, 29))).toBe('2024-02-29');
    });
  });

  // ── parseDateKey ──────────────────────────────────────────────────
  describe('parseDateKey', () => {
    it('parses YYYY-MM-DD into the correct local Date', () => {
      const d = parseDateKey('2026-11-04');
      expect(d.getFullYear()).toBe(2026);
      expect(d.getMonth()).toBe(10); // 0-indexed: 10 = November
      expect(d.getDate()).toBe(4);
    });

    it('round-trips: formatDateKey(parseDateKey(key)) === key', () => {
      const key = '2026-07-15';
      expect(formatDateKey(parseDateKey(key))).toBe(key);
    });

    it('handles first day of month', () => {
      const d = parseDateKey('2026-03-01');
      expect(d.getDate()).toBe(1);
      expect(d.getMonth()).toBe(2); // March
    });
  });

  // ── getTodayKey ───────────────────────────────────────────────────
  describe('getTodayKey', () => {
    it('returns a string in YYYY-MM-DD format', () => {
      expect(getTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('matches formatDateKey of new Date()', () => {
      expect(getTodayKey()).toBe(formatDateKey(new Date()));
    });
  });

  // ── getDateCategory ───────────────────────────────────────────────
  describe('getDateCategory', () => {
    it('returns "today" when dateKey equals todayKey', () => {
      const today = getTodayKey();
      expect(getDateCategory(today, today)).toBe('today');
    });

    it('returns "past" for yesterday', () => {
      expect(getDateCategory('2026-11-03', '2026-11-04')).toBe('past');
    });

    it('returns "past" for a date in a prior year', () => {
      expect(getDateCategory('2025-12-31', '2026-11-04')).toBe('past');
    });

    it('returns "future" for tomorrow', () => {
      expect(getDateCategory('2026-11-05', '2026-11-04')).toBe('future');
    });

    it('returns "future" for a date in the next year', () => {
      expect(getDateCategory('2027-01-01', '2026-11-04')).toBe('future');
    });

    it('returns "past" for first day of month vs last day', () => {
      expect(getDateCategory('2026-11-01', '2026-11-30')).toBe('past');
    });
  });

  // ── formatFriendlyDate ────────────────────────────────────────────
  describe('formatFriendlyDate', () => {
    it('contains the year', () => {
      expect(formatFriendlyDate('2026-11-04')).toContain('2026');
    });

    it('contains abbreviated month name', () => {
      expect(formatFriendlyDate('2026-11-04')).toContain('Nov');
    });

    it('contains the day number', () => {
      expect(formatFriendlyDate('2026-11-04')).toContain('4');
    });
  });

  // ── formatMonthYear ───────────────────────────────────────────────
  describe('formatMonthYear', () => {
    it('formats month and year as "Month YYYY" string', () => {
      expect(formatMonthYear(2026, 10)).toContain('November');
      expect(formatMonthYear(2026, 10)).toContain('2026');
    });

    it('formats January correctly', () => {
      expect(formatMonthYear(2027, 0)).toContain('January');
    });

    it('formats December correctly', () => {
      expect(formatMonthYear(2025, 11)).toContain('December');
    });
  });

  // ── getCalendarGrid ───────────────────────────────────────────────
  describe('getCalendarGrid', () => {
    it('returns either 35 or 42 days (5 or 6 weeks)', () => {
      const grid = getCalendarGrid(2026, 10); // November 2026
      expect([35, 42]).toContain(grid.length);
    });

    it('always starts on Sunday (getDay() === 0)', () => {
      const grid = getCalendarGrid(2026, 10);
      expect(grid[0].getDay()).toBe(0);
    });

    it('always ends on Saturday (getDay() === 6)', () => {
      const grid = getCalendarGrid(2026, 10);
      expect(grid[grid.length - 1].getDay()).toBe(6);
    });

    it('contains all days of the target month', () => {
      const grid = getCalendarGrid(2026, 10); // November = 30 days
      const novDays = grid.filter(d => d.getMonth() === 10).map(d => d.getDate());
      for (let day = 1; day <= 30; day++) {
        expect(novDays).toContain(day);
      }
    });

    it('handles February in a leap year (2024)', () => {
      const grid = getCalendarGrid(2024, 1); // February 2024
      const febDays = grid.filter(d => d.getMonth() === 1).map(d => d.getDate());
      expect(febDays).toContain(29); // Leap day
      expect(febDays.length).toBe(29);
    });

    it('handles February in a non-leap year (2025)', () => {
      const grid = getCalendarGrid(2025, 1); // February 2025
      const febDays = grid.filter(d => d.getMonth() === 1).map(d => d.getDate());
      expect(febDays).not.toContain(29);
      expect(febDays.length).toBe(28);
    });
  });
});
