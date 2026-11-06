import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { PrayerRecord } from '../types';
import {
  formatDateKey,
  formatMonthYear,
  getCalendarGrid,
  getDateCategory,
  getTodayKey,
} from '../utils/dateUtils';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';

interface MonthlyCalendarProps {
  currentYear: number;
  currentMonthIndex: number;
  selectedDateKey: string;
  records: Record<string, PrayerRecord>;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToToday: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  currentYear,
  currentMonthIndex,
  selectedDateKey,
  records,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onJumpToToday,
}) => {
  const todayKey = getTodayKey();
  const calendarDays = getCalendarGrid(currentYear, currentMonthIndex);
  const monthTitle = formatMonthYear(currentYear, currentMonthIndex);

  // Check if we are viewing the month that contains today
  const todayDate = new Date();
  const isViewingCurrentMonth =
    todayDate.getFullYear() === currentYear &&
    todayDate.getMonth() === currentMonthIndex;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs">
      {/* Month Header and Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>{monthTitle}</span>
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Click any past day to view history, or select today to log your Salat.
          </p>
        </div>

        {/* Controls: Prev, Today, Next */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!isViewingCurrentMonth && (
            <button
              onClick={onJumpToToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
              title="Jump to today"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Today</span>
            </button>
          )}

          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 shadow-2xs">
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px bg-stone-200 my-1"></div>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white transition-colors"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-stone-600 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((dayDate, idx) => {
          const dateKey = formatDateKey(dayDate);
          const isCurrentMonth = dayDate.getMonth() === currentMonthIndex;
          const category = getDateCategory(dateKey, todayKey);
          const isToday = category === 'today';
          const isFuture = category === 'future';
          const isSelected = selectedDateKey === dateKey;
          const record = records[dateKey];
          const count = record ? record.count : 0;
          const intensity = PRAYER_INTENSITY_CONFIG[count];

          // Determine button disabled state: Future dates are strictly disabled
          const isDisabled = isFuture;

          return (
            <button
              key={`${dateKey}-${idx}`}
              type="button"
              disabled={isDisabled}
              aria-label={
                isFuture
                  ? `Date ${dateKey} (Future - Disabled)`
                  : `Date ${dateKey}: ${count} of 5 prayers completed`
              }
              onClick={() => {
                if (!isDisabled) {
                  onSelectDate(dateKey);
                }
              }}
              title={
                isFuture
                  ? `${dateKey} (Future - Disabled)`
                  : `${dateKey}: ${count} of 5 prayers completed`
              }
              className={`
                relative aspect-square sm:aspect-auto sm:h-20 rounded-xl p-1.5 sm:p-2 border text-left transition-all flex flex-col justify-between
                ${
                  isDisabled
                    ? 'opacity-35 cursor-not-allowed bg-stone-50/50 border-stone-200/60 text-stone-300'
                    : isSelected
                    ? `${intensity.bgClass} ring-3 ring-stone-900 ring-offset-2 z-10 shadow-md`
                    : intensity.bgClass
                }
                ${!isCurrentMonth && !isDisabled ? 'opacity-50' : ''}
                ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1' : ''}
              `}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs sm:text-sm font-semibold ${
                    count >= 4 && !isDisabled
                      ? 'text-white'
                      : isToday
                      ? 'text-emerald-800 font-bold'
                      : 'text-stone-700'
                  }`}
                >
                  {dayDate.getDate()}
                </span>

                {isToday && (
                  <span
                    className={`text-[9px] px-1 rounded font-bold uppercase tracking-tight ${
                      count >= 4
                        ? 'bg-white/25 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Today
                  </span>
                )}
              </div>

              {/* Bottom Info: Prayer Count Heatmap Display */}
              <div className="w-full flex items-end justify-between mt-auto">
                {!isDisabled && (
                  <>
                    {/* Visual Dots for mobile / compact screens */}
                    <div className="flex items-center gap-0.5 sm:hidden">
                      {count > 0 ? (
                        <span
                          className={`text-[10px] font-bold ${
                            count >= 4 ? 'text-white' : 'text-stone-800'
                          }`}
                        >
                          {count}/5
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                      )}
                    </div>

                    {/* Tablet/Desktop Full label */}
                    <div className="hidden sm:flex items-center justify-between w-full">
                      <span
                        className={`text-[11px] font-medium ${
                          count >= 4 ? 'text-white/95' : 'text-stone-600'
                        }`}
                      >
                        {count > 0 ? `${count} / 5` : '0 / 5'}
                      </span>

                      {/* Small visual contribution bar */}
                      <div className="w-6 h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            count >= 4 ? 'bg-white' : 'bg-emerald-700'
                          }`}
                          style={{ width: `${(count / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {isFuture && (
                  <span className="text-[10px] text-stone-400 font-light hidden sm:block">
                    Locked
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
