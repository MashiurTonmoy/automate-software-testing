import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Lock,
  Ban,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun
} from 'lucide-react';
import { DateCategory, IndividualPrayers, PrayerCount, PrayerRecord } from '../types';
import { formatFriendlyDate, getTodayKey } from '../utils/dateUtils';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';

interface DailyPrayerSubmissionProps {
  selectedDateKey: string;
  category: DateCategory;
  currentRecord: PrayerRecord | null;
  onSaveTodayRecord: (count: PrayerCount, prayers?: IndividualPrayers) => void;
}

const PRAYERS_LIST: {
  key: keyof IndividualPrayers;
  name: string;
  arabic: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'fajr', name: 'Fajr', arabic: 'الفجر', time: 'Dawn', icon: Sunrise },
  { key: 'dhuhr', name: 'Dhuhr', arabic: 'الظهر', time: 'Noon', icon: Sun },
  { key: 'asr', name: 'Asr', arabic: 'العصر', time: 'Afternoon', icon: CloudSun },
  { key: 'maghrib', name: 'Maghrib', arabic: 'المغرب', time: 'Sunset', icon: Sunset },
  { key: 'isha', name: 'Isha', arabic: 'العشاء', time: 'Night', icon: Moon },
];

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

  // Individual prayers state
  const [prayers, setPrayers] = useState<IndividualPrayers>({
    fajr: currentRecord?.fajr ?? (currentRecord ? currentRecord.count >= 1 : false),
    dhuhr: currentRecord?.dhuhr ?? (currentRecord ? currentRecord.count >= 2 : false),
    asr: currentRecord?.asr ?? (currentRecord ? currentRecord.count >= 3 : false),
    maghrib: currentRecord?.maghrib ?? (currentRecord ? currentRecord.count >= 4 : false),
    isha: currentRecord?.isha ?? (currentRecord ? currentRecord.count >= 5 : false),
  });

  const [selectedCount, setSelectedCount] = useState<PrayerCount>(currentRecord?.count ?? 0);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Sync state if record changes or selected date changes
  useEffect(() => {
    const c = currentRecord?.count ?? 0;
    setSelectedCount(c);
    setPrayers({
      fajr: currentRecord?.fajr ?? c >= 1,
      dhuhr: currentRecord?.dhuhr ?? c >= 2,
      asr: currentRecord?.asr ?? c >= 3,
      maghrib: currentRecord?.maghrib ?? c >= 4,
      isha: currentRecord?.isha ?? c >= 5,
    });
    setJustSaved(false);
  }, [selectedDateKey, currentRecord]);

  // Toggle single prayer
  const handleTogglePrayer = (prayerKey: keyof IndividualPrayers) => {
    if (!isToday) return;

    const nextPrayers = {
      ...prayers,
      [prayerKey]: !prayers[prayerKey],
    };
    setPrayers(nextPrayers);

    // Calculate count from toggled prayers
    const count = Object.values(nextPrayers).filter(Boolean).length as PrayerCount;
    setSelectedCount(count);
  };

  // Quick count selection
  const handleSelectCount = (count: PrayerCount) => {
    if (!isToday) return;
    setSelectedCount(count);
    setPrayers({
      fajr: count >= 1,
      dhuhr: count >= 2,
      asr: count >= 3,
      maghrib: count >= 4,
      isha: count >= 5,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isToday) return;

    onSaveTodayRecord(selectedCount, prayers);
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
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-medium ${PRAYER_INTENSITY_CONFIG[currentRecord.count].badgeClass} flex items-center gap-1.5`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>
                Recorded: <strong>{currentRecord.count} / 5</strong>
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-500 border border-stone-200">
              <span>Unrecorded</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Body: Mode-specific UI */}
      <div className="mt-5">
        {/* ================= CASE 1: TODAY (EDITABLE) ================= */}
        {isToday && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Individual Prayers (Click to Toggle)
                </label>
                <span className="text-xs font-bold text-emerald-800">
                  {selectedCount} of 5 Completed
                </span>
              </div>

              {/* 5 Individual Prayer Checkboxes / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {PRAYERS_LIST.map(({ key, name, arabic, time, icon: Icon }) => {
                  const isChecked = prayers[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`${name} prayer (${time})`}
                      onClick={() => handleTogglePrayer(key)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-300'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isChecked ? 'text-white' : 'text-emerald-700'}`} />
                      <div className="text-xs font-bold">
                        {name} <span className="text-[10px] font-normal opacity-80">({arabic})</span>
                      </div>
                      <div className={`text-[10px] ${isChecked ? 'text-emerald-100' : 'text-stone-400'}`}>
                        {time}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Count Selection Bar */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                Or Quick Pick Total Count (0 – 5)
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {counts.map((count) => {
                  const isSelected = selectedCount === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      aria-label={`Select ${count} prayers`}
                      title={`Select ${count} prayers`}
                      onClick={() => handleSelectCount(count)}
                      className={`py-2 px-1 rounded-xl text-center text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-400 shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                      }`}
                    >
                      {count}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit / Update Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {justSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-200 animate-in zoom-in-75" />
                    <span>Saved to Database!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <span>
                      {currentRecord ? "Update Today's Record" : "Submit Today's Record"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= CASE 2: PAST DATE (READ-ONLY) ================= */}
        {isPast && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/90">
              <div className="flex items-center gap-2 text-stone-700 text-xs font-bold mb-1">
                <Lock className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Historical Record (Read-Only)</span>
              </div>
              <p className="text-[11px] text-stone-500 mb-3">
                Previous dates cannot be modified or resubmitted to preserve authentic history.
              </p>

              {/* Individual Prayer Summary for Past Date */}
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {PRAYERS_LIST.map(({ key, name, icon: Icon }) => {
                  const wasPrayed = currentRecord
                    ? (currentRecord[key] ?? (currentRecord.count >= (PRAYERS_LIST.findIndex(p => p.key === key) + 1)))
                    : false;
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-lg border text-xs flex flex-col items-center gap-1 ${
                        wasPrayed
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold'
                          : 'bg-stone-100 text-stone-400 border-stone-200'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${wasPrayed ? 'text-emerald-700' : 'text-stone-300'}`} />
                      <span className="text-[11px]">{name}</span>
                      <span className="text-[9px]">{wasPrayed ? '✓ Prayed' : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>Status on {formattedDate}:</span>
              <span className="font-semibold text-stone-800">
                {currentRecord ? `${currentRecord.count} of 5 Prayers Recorded` : 'No prayers were recorded'}
              </span>
            </div>
          </div>
        )}

        {/* ================= CASE 3: FUTURE DATE (DISABLED) ================= */}
        {isFuture && (
          <div className="p-6 rounded-xl bg-stone-50 border border-dashed border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
              <Ban className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Future Date Disabled</h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Prayers can only be recorded on the day they occur. Please return on {formattedDate} to log your prayers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
