export type PrayerCount = 0 | 1 | 2 | 3 | 4 | 5;

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface IndividualPrayers {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface PrayerRecord {
  date: string; // YYYY-MM-DD
  count: PrayerCount;
  fajr?: boolean;
  dhuhr?: boolean;
  asr?: boolean;
  maghrib?: boolean;
  isha?: boolean;
  updatedAt: string; // ISO 8601
}

export type DateCategory = 'today' | 'past' | 'future';

export interface CalendarDay {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  category: DateCategory;
  record: PrayerRecord | null;
  isSelected: boolean;
}

export interface MonthlyStats {
  totalPrayers: number;
  maxPossiblePrayers: number;
  recordedDays: number;
  perfectDays: number;
  averagePerDay: number;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  timezone?: string;
}
