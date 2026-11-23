import React from 'react';
import { Award, Flame, CalendarCheck, TrendingUp, Sparkles } from 'lucide-react';
import { PrayerRecord } from '../types';
import { formatMonthYear, getTodayKey } from '../utils/dateUtils';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';

interface MonthlySummaryProps {
  currentYear: number;
  currentMonthIndex: number;
  records: Record<string, PrayerRecord>;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  currentYear,
  currentMonthIndex,
  records,
}) => {
  const todayKey = getTodayKey();
  const todayRecord = records[todayKey];
  const todayCount = todayRecord ? todayRecord.count : 0;
  const monthName = formatMonthYear(currentYear, currentMonthIndex);

  // Compute monthly stats
  // Filter records that belong to currentYear and currentMonthIndex
  const monthPrefix = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  let totalPrayersThisMonth = 0;
  let recordedDays = 0;
  let perfectDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${monthPrefix}-${String(day).padStart(2, '0')}`;
    const rec = records[key];
    if (rec) {
      totalPrayersThisMonth += rec.count;
      recordedDays += 1;
      if (rec.count === 5) {
        perfectDays += 1;
      }
    }
  }

  const averagePerRecordedDay =
    recordedDays > 0 ? (totalPrayersThisMonth / recordedDays).toFixed(1) : '0';

  const todayConfig = PRAYER_INTENSITY_CONFIG[todayCount];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Today's Prayer Focus Card */}
      <div className="md:col-span-1 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            <span>Today&apos;s Salat</span>
            <span className="text-emerald-700 font-bold">5 Daily</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{todayCount}</span>
            <span className="text-stone-400 font-medium">/ 5 completed</span>
          </div>
          <div className="mt-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${todayConfig.badgeClass}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{todayCount === 5 ? "Alhamdulillah (All 5)" : `${5 - todayCount} remaining`}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-500"
              style={{ width: `${(todayCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Prayers Completed This Month */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Monthly Total
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-stone-900">
            {totalPrayersThisMonth}
            <span className="text-stone-400 text-sm font-normal ml-1">Salat</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1 truncate" title={monthName}>
            Completed in {monthName}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-stone-100 text-xs text-stone-500">
          Avg <strong>{averagePerRecordedDay}</strong> / recorded day
        </div>
      </div>

      {/* 3. Perfect 5/5 Days */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Perfect Days
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
            <Flame className="w-4 h-4 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-stone-900">
            {perfectDays}
            <span className="text-stone-400 text-sm font-normal ml-1">days</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            All 5 daily prayers performed
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-stone-100 text-xs text-stone-500">
          {recordedDays > 0
            ? `${Math.round((perfectDays / recordedDays) * 100)}% of tracked days`
            : 'No days recorded yet'}
        </div>
      </div>

      {/* 4. Days Tracked */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Active Days
          </span>
          <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
            <CalendarCheck className="w-4 h-4 text-stone-600" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold text-stone-900">
            {recordedDays}
            <span className="text-stone-400 text-sm font-normal ml-1">/ {daysInMonth}</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            Days logged this month
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-stone-100 text-xs text-stone-500 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>Keep your prayer streak alive</span>
        </div>
      </div>
    </div>
  );
};
