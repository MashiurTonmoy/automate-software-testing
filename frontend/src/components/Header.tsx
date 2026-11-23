import React from 'react';
import { Calendar as CalendarIcon, User, LogOut, CheckCircle2 } from 'lucide-react';
import { formatFriendlyDate, getTodayKey } from '../utils/dateUtils';

interface HeaderProps {
  userId: string;
  onSwitchUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({ userId, onSwitchUser }) => {
  const todayKey = getTodayKey();
  const formattedToday = formatFriendlyDate(todayKey);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
        {/* App Title & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 ring-4 ring-emerald-50">
            {/* Minimal Serene Crescent / Star or Check icon */}
            <CheckCircle2 className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
              Salat Tracker
            </h1>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              Daily Prayer Log & Heatmap
            </p>
          </div>
        </div>

        {/* Right side: Today badge & User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Today Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200">
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-700" />
            <span>Today: {formattedToday}</span>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 rounded-full pl-3 pr-1.5 py-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
              <User className="w-3.5 h-3.5 text-emerald-700" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate font-semibold" title={userId}>
                {userId}
              </span>
            </div>
            <button
              onClick={onSwitchUser}
              className="p-1 rounded-full text-stone-500 hover:text-emerald-800 hover:bg-emerald-100/70 transition-colors"
              title="Switch or change user"
              aria-label="Switch User"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
