import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UserAuthModal } from './components/UserAuthModal';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { DailyPrayerSubmission } from './components/DailyPrayerSubmission';
import { CalendarLegend } from './components/CalendarLegend';
import { MonthlySummary } from './components/MonthlySummary';
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import { getDateCategory, getTodayKey } from './utils/dateUtils';
import { IndividualPrayers, PrayerCount, PrayerRecord } from './types';
import { Calendar as CalendarIcon, Check, Cloud, Database } from 'lucide-react';

export const App: React.FC = () => {
  const todayKey = getTodayKey();
  const initialDate = new Date();

  // User state
  const [userId, setUserId] = useState<string | null>(() => storageService.getCurrentUserId());
  const [isSwitchingUser, setIsSwitchingUser] = useState<boolean>(false);
  const [knownUsers, setKnownUsers] = useState<string[]>(() => storageService.getKnownUsers());
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(Boolean(apiService.getToken()));

  // Calendar View state
  const [currentYear, setCurrentYear] = useState<number>(initialDate.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialDate.getMonth());

  // Selected date state (defaults to today)
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);

  // Records for active user
  const [records, setRecords] = useState<Record<string, PrayerRecord>>({});

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3000);
  };

  const currentMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;

  // Load records whenever userId or month changes
  useEffect(() => {
    if (userId) {
      // 1. Instant local load
      const userRecords = storageService.getAllRecords(userId);
      setRecords(userRecords);
      setKnownUsers(storageService.getKnownUsers());

      // 2. Background sync with backend if token exists
      if (apiService.getToken()) {
        setIsCloudSynced(true);
        apiService.getMonthlyRecords(currentMonthStr).then((remoteRecords) => {
          if (remoteRecords && Object.keys(remoteRecords).length > 0) {
            setRecords((prev) => {
              const merged = { ...prev, ...remoteRecords };
              storageService.setAllRecords(userId, merged);
              return merged;
            });
          }
        }).catch(() => {
          // Fall back gracefully to local storage
        });
      } else {
        setIsCloudSynced(false);
      }
    } else {
      setRecords({});
    }
  }, [userId, currentMonthStr]);

  // Handle setting / changing User ID
  const handleSetUser = (newUserId: string) => {
    storageService.setCurrentUserId(newUserId);
    setUserId(newUserId);
    setIsSwitchingUser(false);
    setKnownUsers(storageService.getKnownUsers());
    setIsCloudSynced(Boolean(apiService.getToken()));
    showToast(`Welcome, ${newUserId}! Records loaded.`);
  };

  // Handle switching user
  const handleOpenSwitchUser = () => {
    setIsSwitchingUser(true);
  };

  // Month navigation
  const handlePrevMonth = useCallback(() => {
    setCurrentMonthIndex((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonthIndex((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  const handleJumpToToday = useCallback(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonthIndex(now.getMonth());
    setSelectedDateKey(todayKey);
  }, [todayKey]);

  // Date selection with future date check
  const handleSelectDate = (dateKey: string) => {
    const category = getDateCategory(dateKey, todayKey);
    if (category === 'future') {
      return;
    }
    setSelectedDateKey(dateKey);
  };

  // Save or update today's record
  const handleSaveTodayRecord = async (count: PrayerCount, prayers?: IndividualPrayers) => {
    if (!userId) return;

    // Strictly enforce that only today can be modified
    const category = getDateCategory(selectedDateKey, todayKey);
    if (category !== 'today') {
      return;
    }

    // Save locally for instant UI update
    const updated = storageService.saveRecord(userId, todayKey, count, prayers);
    setRecords((prev) => ({
      ...prev,
      [todayKey]: updated,
    }));

    // If backend authenticated, sync to Supabase
    if (apiService.getToken()) {
      const res = await apiService.savePrayer(todayKey, count, prayers);
      if (res.success && res.record) {
        setRecords((prev) => ({
          ...prev,
          [todayKey]: res.record!,
        }));
        showToast(`Today's record synced to cloud (${count} of 5 Salat).`);
        return;
      }
    }

    showToast(`Today's record updated to ${count} of 5 Salat.`);
  };

  // Category and record of selected date
  const selectedCategory = getDateCategory(selectedDateKey, todayKey);
  const currentSelectedRecord = records[selectedDateKey] || null;

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-800 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium border border-stone-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Prompt / Modal if no user or switching */}
      {(!userId || isSwitchingUser) && (
        <UserAuthModal
          currentUserId={userId}
          knownUsers={knownUsers}
          onSubmit={handleSetUser}
          onClose={userId ? () => setIsSwitchingUser(false) : undefined}
        />
      )}

      {/* App Header */}
      <Header
        userId={userId || 'Guest'}
        onSwitchUser={handleOpenSwitchUser}
      />

      {/* Cloud Sync Status Strip */}
      {userId && (
        <div className="bg-emerald-900/90 text-emerald-100 text-xs py-1.5 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCloudSynced ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Cloud Sync Active (PostgreSQL + Supabase)</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Local Mode (Connect account for cloud sync)</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-emerald-200/80">
              5 Daily Prayers Tracking Enabled
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Monthly Summary Cards & Today's Progress */}
        <MonthlySummary
          currentYear={currentYear}
          currentMonthIndex={currentMonthIndex}
          records={records}
        />

        {/* Main Grid: Calendar (Main Focus) & Daily Submission Sidebar/Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Monthly Calendar — Main Focus (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <MonthlyCalendar
              currentYear={currentYear}
              currentMonthIndex={currentMonthIndex}
              selectedDateKey={selectedDateKey}
              records={records}
              onSelectDate={handleSelectDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onJumpToToday={handleJumpToToday}
            />

            {/* Intensity Legend */}
            <CalendarLegend />
          </div>

          {/* Daily Submission & Date Inspector (5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-4 sticky top-22">
            <DailyPrayerSubmission
              selectedDateKey={selectedDateKey}
              category={selectedCategory}
              currentRecord={currentSelectedRecord}
              onSaveTodayRecord={handleSaveTodayRecord}
            />

            {/* Date Rules Quick Guidance Card */}
            <div className="bg-stone-100/80 rounded-2xl p-4 border border-stone-200/70 text-xs text-stone-600 space-y-2">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
                <span>Salat Tracker Guidelines</span>
              </div>
              <ul className="space-y-1.5 text-stone-500 pl-4 list-disc text-[11px] leading-relaxed">
                <li>
                  <strong className="text-stone-700">Today:</strong> Click individual prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) or pick a total count (0–5). Updates anytime in-place.
                </li>
                <li>
                  <strong className="text-stone-700">Previous Days:</strong> View past prayer breakdowns. Historical records are strictly read-only to preserve authentic history.
                </li>
                <li>
                  <strong className="text-stone-700">Future Days:</strong> Disabled until that day arrives.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>
            Salat Tracker &bull; Minimal, peaceful daily prayer tracking
          </p>
          <p className="text-stone-400">
            Active User: <span className="font-medium text-stone-600">{userId || 'None'}</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
