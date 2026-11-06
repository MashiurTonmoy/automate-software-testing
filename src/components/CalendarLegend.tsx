import React from 'react';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';
import { PrayerCount } from '../types';

export const CalendarLegend: React.FC = () => {
  const counts: PrayerCount[] = [0, 1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 text-stone-600 font-medium">
        <span className="font-semibold text-stone-800">Salat Completed:</span>
        <span className="text-stone-400">0 to 5 daily prayers</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-[11px] text-stone-400">None</span>
        <div className="flex items-center gap-1.5">
          {counts.map((count) => {
            const config = PRAYER_INTENSITY_CONFIG[count];
            return (
              <div
                key={count}
                className="group relative flex flex-col items-center"
              >
                <div
                  className={`w-6 h-6 rounded-md ${config.legendBg} flex items-center justify-center text-[10px] font-semibold transition-transform group-hover:scale-110 shadow-2xs`}
                >
                  <span className={count >= 4 ? 'text-white' : 'text-stone-700'}>
                    {count}
                  </span>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap">
                  <div className="bg-stone-900 text-white text-[11px] px-2 py-1 rounded shadow-md font-medium">
                    {count} {count === 1 ? 'Prayer' : 'Prayers'}: {config.description}
                  </div>
                  <div className="w-1.5 h-1.5 bg-stone-900 rotate-45 -mt-0.5"></div>
                </div>
              </div>
            );
          })}
        </div>
        <span className="text-[11px] text-stone-400">All 5</span>
      </div>
    </div>
  );
};
