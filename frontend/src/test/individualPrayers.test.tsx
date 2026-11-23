import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DailyPrayerSubmission } from '../components/DailyPrayerSubmission';
import { getTodayKey } from '../utils/dateUtils';
import { IndividualPrayers } from '../types';

describe('DailyPrayerSubmission – Individual Prayers Tracking', () => {
  const todayKey = getTodayKey();

  it('renders all 5 individual prayer buttons (Fajr, Dhuhr, Asr, Maghrib, Isha) for today', () => {
    const handleSave = vi.fn();
    render(
      <DailyPrayerSubmission
        selectedDateKey={todayKey}
        category="today"
        currentRecord={null}
        onSaveTodayRecord={handleSave}
      />
    );

    expect(screen.getByRole('button', { name: /Fajr prayer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dhuhr prayer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Asr prayer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Maghrib prayer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Isha prayer/i })).toBeInTheDocument();
  });

  it('updates count and submits individual prayers when toggled', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(
      <DailyPrayerSubmission
        selectedDateKey={todayKey}
        category="today"
        currentRecord={null}
        onSaveTodayRecord={handleSave}
      />
    );

    // Click Fajr and Maghrib
    await user.click(screen.getByRole('button', { name: /Fajr prayer/i }));
    await user.click(screen.getByRole('button', { name: /Maghrib prayer/i }));

    expect(screen.getByText('2 of 5 Completed')).toBeInTheDocument();

    // Click submit
    await user.click(screen.getByRole('button', { name: /Submit Today's Record/i }));

    expect(handleSave).toHaveBeenCalledWith(
      2,
      expect.objectContaining({
        fajr: true,
        dhuhr: false,
        asr: false,
        maghrib: true,
        isha: false,
      } as Partial<IndividualPrayers>)
    );
  });
});
