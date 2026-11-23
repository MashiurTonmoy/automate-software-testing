import { Request } from 'express';

export type PrayerCount = 0 | 1 | 2 | 3 | 4 | 5;

export interface IndividualPrayers {
  fajr: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
}

export interface UserAuthPayload {
  userId: string;
  username: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserAuthPayload;
}

export interface MonthlyStatsResponse {
  totalPrayers: number;
  maxPossiblePrayers: number;
  recordedDays: number;
  perfectDays: number;
  averagePerDay: number;
}
