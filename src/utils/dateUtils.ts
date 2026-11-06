import { DateCategory } from '../types';

/**
 * Format a Date object to local YYYY-MM-DD string
 * Uses local year, month, and day to completely avoid UTC timezone shifts.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's local date as YYYY-MM-DD string
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Parse a YYYY-MM-DD string safely into a local Date object (at midnight local time)
 */
export function parseDateKey(dateKey: string): Date {
  const [yearStr, monthStr, dayStr] = dateKey.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
}

/**
 * Determine whether a given date key is today, in the past, or in the future
 */
export function getDateCategory(dateKey: string, todayKey: string = getTodayKey()): DateCategory {
  if (dateKey === todayKey) {
    return 'today';
  }
  return dateKey < todayKey ? 'past' : 'future';
}

/**
 * Format date for friendly header display (e.g. "Wednesday, Nov 4, 2026")
 */
export function formatFriendlyDate(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format month and year (e.g. "November 2026")
 */
export function formatMonthYear(year: number, monthIndex: number): string {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Returns a 35 or 42 element grid of Date objects for a monthly calendar view,
 * starting on Sunday and ending on Saturday, including adjacent month padding days.
 */
export function getCalendarGrid(year: number, monthIndex: number): Date[] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  
  // Start from the Sunday of the first week
  const startDate = new Date(year, monthIndex, 1 - startDayOfWeek);
  
  const days: Date[] = [];
  // 6 weeks * 7 days = 42 days grid for consistency
  for (let i = 0; i < 42; i++) {
    const day = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + i
    );
    days.push(day);
  }

  // If the last week is entirely in the next month and we already have 5 weeks, trim to 35
  const fifthWeekEnd = days[34];
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0).getDate();
  const fifthWeekIncludesAll = days.slice(0, 35).some(
    d => d.getMonth() === monthIndex && d.getDate() === lastDayOfMonth
  );

  if (fifthWeekIncludesAll && fifthWeekEnd.getMonth() !== monthIndex) {
    return days.slice(0, 35);
  }

  return days;
}
