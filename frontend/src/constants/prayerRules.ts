import { PrayerCount } from '../types';

export interface IntensityConfig {
  count: PrayerCount;
  label: string;
  shortLabel: string;
  description: string;
  bgClass: string;
  legendBg: string;
  badgeClass: string;
}

export const PRAYER_INTENSITY_CONFIG: Record<PrayerCount, IntensityConfig> = {
  0: {
    count: 0,
    label: '0 Prayers',
    shortLabel: '0 / 5',
    description: 'Neutral background',
    bgClass: 'bg-stone-100 hover:bg-stone-200/90 text-stone-700 border-stone-200/90',
    legendBg: 'bg-stone-100 border border-stone-300',
    badgeClass: 'bg-stone-100 text-stone-600 border border-stone-200',
  },
  1: {
    count: 1,
    label: '1 Prayer',
    shortLabel: '1 / 5',
    description: 'Very light green',
    bgClass: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-200',
    legendBg: 'bg-emerald-100 border border-emerald-300',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  },
  2: {
    count: 2,
    label: '2 Prayers',
    shortLabel: '2 / 5',
    description: 'Light green',
    bgClass: 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 border-emerald-300',
    legendBg: 'bg-emerald-200 border border-emerald-400',
    badgeClass: 'bg-emerald-100 text-emerald-850 border border-emerald-300',
  },
  3: {
    count: 3,
    label: '3 Prayers',
    shortLabel: '3 / 5',
    description: 'Medium green',
    bgClass: 'bg-emerald-400 hover:bg-emerald-500 text-emerald-950 font-semibold border-emerald-500',
    legendBg: 'bg-emerald-400 border border-emerald-500',
    badgeClass: 'bg-emerald-300 text-emerald-950 border border-emerald-400',
  },
  4: {
    count: 4,
    label: '4 Prayers',
    shortLabel: '4 / 5',
    description: 'Strong green',
    bgClass: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border-emerald-700 shadow-xs',
    legendBg: 'bg-emerald-600 border border-emerald-700',
    badgeClass: 'bg-emerald-600 text-white border border-emerald-700',
  },
  5: {
    count: 5,
    label: '5 Prayers',
    shortLabel: '5 / 5',
    description: 'Dark green (Complete)',
    bgClass: 'bg-emerald-800 hover:bg-emerald-900 text-white font-semibold border-emerald-900 shadow-xs',
    legendBg: 'bg-emerald-800 border border-emerald-900',
    badgeClass: 'bg-emerald-800 text-white border border-emerald-900',
  },
};
