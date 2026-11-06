import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Lock,
  Ban,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DateCategory, PrayerCount, PrayerRecord } from '../types';
import { formatFriendlyDate, getTodayKey } from '../utils/dateUtils';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';

interface DailyPrayerSubmissionProps {
  selectedDateKey: string;
  category: DateCategory;
  currentRecord: PrayerRecord | null;
  onSaveTodayRecord: (count: PrayerCount) => void;
}

export const DailyPrayerSubmission: React.FC<DailyPrayerSubmissionProps> = ({
  selectedDateKey,
  category,
  currentRecord,
  onSaveTodayRecord,
}) => {
  const todayKey = getTodayKey();
  const isToday = category === 'today' || selectedDateKey === todayKey;
  const isPast = category === 'past';
  const isFuture = category === 'future';

  // Local count state for today's submission
  const savedCount = currentRecord?.count ?? 0;
  const [selectedCount, setSelectedCount] = useState<PrayerCount>(savedCount);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync state if record changes or selected date changes
  useEffect(() => {
    setSelectedCount(currentRecord?.count ?? 0);
    setJustSaved(false);
  }, [selectedDateKey, currentRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isToday) return;

    onSaveTodayRecord(selectedCount);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const formattedDate = formatFriendlyDate(selectedDateKey);
  const counts: PrayerCount[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs transition-all">
      {/* Date Header & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Selected Date
            </span>
            {isToday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Today (Active & Editable)
              </span>
            )}
            {isPast && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                <Lock className="w-3 h-3 text-stone-500" />
                Past Date (Read-Only)
              </span>
            )}
            {isFuture && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Ban className="w-3 h-3 text-amber-600" />
                Future Date (Disabled)
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-stone-900 mt-1 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-700" />
            {formattedDate}
          </h3>
        </div>

        {/* Saved Count Status */}
        <div className="flex items-center gap-2">
          {currentRecord ? (
            <div className={`px-3 py-1.5 rounded-xl text-xs font-medium ${PRAYER_INTENSITY_CONFIG[currentRecord.count].badgeClass} flex items-center gap-1.5`}>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                Recorded: <strong>{currentRecord.count} / 5</strong>
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">
              {isFuture ? 'No record (Future)' : 'Not recorded (0 / 5)'}
            </div>
          )}
        </div>
      </div>

      {/* Case 1: Today — Active Input Interface */}
      {isToday && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                Select Completed Salat Today:
              </label>
              <span className="text-xs text-stone-500">
                {selectedCount === 5 ? 'All 5 completed' : `${selectedCount} of 5 completed`}
              </span>
            </div>

            {/* Prayer Count Selector Buttons 0 to 5 */}
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {counts.map((val) => {
                const config = PRAYER_INTENSITY_CONFIG[val];
                const isSelected = selectedCount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    aria-label={`Select ${val} prayers`}
                    onClick={() => setSelectedCount(val)}
                    className={`h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? `${config.legendBg} ring-3 ring-emerald-600 ring-offset-2 scale-[1.03] shadow-md font-bold`
                        : `${config.legendBg} opacity-80 hover:opacity-100 hover:scale-[1.01]`
                    }`}
                  >
                    <span
                      className={`text-base sm:text-lg font-bold ${
                        val >= 4 ? 'text-white' : 'text-stone-800'
                      }`}
                    >
                      {val}
                    </span>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        val >= 4 ? 'text-emerald-100' : 'text-stone-600'
                      }`}
                    >
                      {val === 0 ? 'None' : val === 5 ? 'All 5' : 'Salat'}
                    </span>
                    {currentRecord?.count === val && (
                      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-white" title="Currently Saved" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
            <div className="flex justify-between text-xs text-stone-600 mb-1.5 font-medium">
              <span>Daily Completion</span>
              <span className="text-emerald-700 font-semibold">
                {Math.round((selectedCount / 5) * 100)}%
              </span>
            </div>
            <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${(selectedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Submit / Update Button and Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 text-stone-500 text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>You can submit multiple times throughout the day as you pray.</span>
            </div>

            <button
              type="submit"
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                justSaved
                  ? 'bg-emerald-800 text-white shadow-emerald-800/30'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-md'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {justSaved
                  ? 'Record Saved!'
                  : currentRecord !== null
                  ? "Update Today's Record"
                  : "Submit Today's Record"}
              </span>
            </button>
          </div>

          {justSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Today&apos;s record successfully updated to <strong>{selectedCount} of 5 Salat</strong>. Calendar color updated!
              </span>
            </div>
          )}
        </form>
      )}

      {/* Case 2: Past Date — Strictly Read-Only */}
      {isPast && (
        <div className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-stone-200/80 text-stone-600 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-stone-800">
                Historical Record (Read-Only)
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Previous dates cannot be modified or resubmitted. Past prayer records are locked to maintain authentic historical consistency.
              </p>
            </div>
          </div>

          {/* Record Display Card */}
          <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                Completed on {formattedDate}
              </p>
              <div className="text-2xl font-bold text-stone-900 mt-0.5 flex items-baseline gap-1">
                <span>{savedCount}</span>
                <span className="text-stone-400 text-base font-normal">/ 5 Salat</span>
              </div>
              {currentRecord?.updatedAt && (
                <p className="text-[11px] text-stone-400 mt-1">
                  Recorded at {new Date(currentRecord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  PRAYER_INTENSITY_CONFIG[savedCount].badgeClass
                }`}
              >
                {PRAYER_INTENSITY_CONFIG[savedCount].label} ({PRAYER_INTENSITY_CONFIG[savedCount].description})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case 3: Future Date — Disabled Notice */}
      {isFuture && (
        <div className="mt-5">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-900">
                Future Date Cannot Be Selected
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                Salat records cannot be logged in advance. Only today&apos;s date is open for submission.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
