import { describe, it, expect } from 'vitest';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';
import { PrayerCount } from '../types';

describe('prayerRules', () => {
  it('covers all prayer counts from 0 to 5', () => {
    const counts: PrayerCount[] = [0, 1, 2, 3, 4, 5];
    counts.forEach((c) => {
      expect(PRAYER_INTENSITY_CONFIG[c]).toBeDefined();
      expect(PRAYER_INTENSITY_CONFIG[c].count).toBe(c);
    });
  });

  it('matches green intensity rules from specification', () => {
    // 0 prayers: No green / neutral background
    expect(PRAYER_INTENSITY_CONFIG[0].bgClass).toContain('stone');
    expect(PRAYER_INTENSITY_CONFIG[0].bgClass).not.toContain('emerald');

    // 1 prayer: Very light green
    expect(PRAYER_INTENSITY_CONFIG[1].description.toLowerCase()).toContain('very light green');
    expect(PRAYER_INTENSITY_CONFIG[1].bgClass).toContain('emerald-100');

    // 2 prayers: Light green
    expect(PRAYER_INTENSITY_CONFIG[2].description.toLowerCase()).toContain('light green');
    expect(PRAYER_INTENSITY_CONFIG[2].bgClass).toContain('emerald-200');

    // 3 prayers: Medium green
    expect(PRAYER_INTENSITY_CONFIG[3].description.toLowerCase()).toContain('medium green');
    expect(PRAYER_INTENSITY_CONFIG[3].bgClass).toContain('emerald-400');

    // 4 prayers: Strong green
    expect(PRAYER_INTENSITY_CONFIG[4].description.toLowerCase()).toContain('strong green');
    expect(PRAYER_INTENSITY_CONFIG[4].bgClass).toContain('emerald-600');

    // 5 prayers: Dark green
    expect(PRAYER_INTENSITY_CONFIG[5].description.toLowerCase()).toContain('dark green');
    expect(PRAYER_INTENSITY_CONFIG[5].bgClass).toContain('emerald-800');
  });
});
