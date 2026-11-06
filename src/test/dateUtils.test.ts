import { describe, it, expect } from 'vitest';
import {
  formatDateKey,
  parseDateKey,
  getDateCategory,
  getTodayKey,
  formatFriendlyDate,
} from '../utils/dateUtils';

describe('dateUtils', () => {
  it('formats local Date to YYYY-MM-DD correctly without timezone shifts', () => {
    const d = new Date(2026, 10, 4); // November 4, 2026 in local time
    expect(formatDateKey(d)).toBe('2026-11-04');
  });

  it('parses YYYY-MM-DD into a valid local Date object', () => {
    const d = parseDateKey('2026-11-04');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10); // 0-indexed: 10 = Nov
    expect(d.getDate()).toBe(4);
  });

  it('accurately identifies today, past dates, and future dates', () => {
    const today = getTodayKey();
    expect(getDateCategory(today, today)).toBe('today');

    // A past date relative to 2026-11-04
    expect(getDateCategory('2026-11-03', '2026-11-04')).toBe('past');
    expect(getDateCategory('2025-12-31', '2026-11-04')).toBe('past');

    // A future date relative to 2026-11-04
    expect(getDateCategory('2026-11-05', '2026-11-04')).toBe('future');
    expect(getDateCategory('2027-01-01', '2026-11-04')).toBe('future');
  });

  it('formats friendly date text cleanly', () => {
    const text = formatFriendlyDate('2026-11-04');
    expect(text).toContain('2026');
    expect(text).toContain('Nov');
  });
});
