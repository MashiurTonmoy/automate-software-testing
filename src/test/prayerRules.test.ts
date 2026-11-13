import { describe, it, expect } from 'vitest';
import { PRAYER_INTENSITY_CONFIG } from '../constants/prayerRules';
import { PrayerCount } from '../types';

describe('prayerRules – PRAYER_INTENSITY_CONFIG', () => {
  const ALL_COUNTS: PrayerCount[] = [0, 1, 2, 3, 4, 5];

  // ── Structural integrity ──────────────────────────────────────────
  it('defines config entries for every valid prayer count (0–5)', () => {
    ALL_COUNTS.forEach((c) => {
      expect(PRAYER_INTENSITY_CONFIG[c]).toBeDefined();
      expect(PRAYER_INTENSITY_CONFIG[c].count).toBe(c);
    });
  });

  it('every config entry has required shape (count, bgClass, legendBg, description)', () => {
    ALL_COUNTS.forEach((c) => {
      const cfg = PRAYER_INTENSITY_CONFIG[c];
      expect(typeof cfg.count).toBe('number');
      expect(typeof cfg.bgClass).toBe('string');
      expect(cfg.bgClass.length).toBeGreaterThan(0);
      expect(typeof cfg.legendBg).toBe('string');
      expect(cfg.legendBg.length).toBeGreaterThan(0);
      expect(typeof cfg.description).toBe('string');
      expect(cfg.description.length).toBeGreaterThan(0);
    });
  });

  // ── 0 prayers: neutral / no green ────────────────────────────────
  it('count 0 → neutral (stone) background, no emerald class', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[0];
    expect(cfg.bgClass).toContain('stone');
    expect(cfg.bgClass).not.toContain('emerald');
  });

  // ── Gradient: each higher count is a darker shade of emerald ─────
  it('count 1 → very light green (emerald-100)', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[1];
    expect(cfg.description.toLowerCase()).toContain('very light green');
    expect(cfg.bgClass).toContain('emerald-100');
  });

  it('count 2 → light green (emerald-200)', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[2];
    expect(cfg.description.toLowerCase()).toContain('light green');
    expect(cfg.bgClass).toContain('emerald-200');
  });

  it('count 3 → medium green (emerald-400)', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[3];
    expect(cfg.description.toLowerCase()).toContain('medium green');
    expect(cfg.bgClass).toContain('emerald-400');
  });

  it('count 4 → strong green (emerald-600)', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[4];
    expect(cfg.description.toLowerCase()).toContain('strong green');
    expect(cfg.bgClass).toContain('emerald-600');
  });

  it('count 5 → dark green (emerald-800) – full salat', () => {
    const cfg = PRAYER_INTENSITY_CONFIG[5];
    expect(cfg.description.toLowerCase()).toContain('dark green');
    expect(cfg.bgClass).toContain('emerald-800');
  });

  // ── legendBg should mirror the visual intent ──────────────────────
  it('legendBg for count 0 is neutral (not emerald)', () => {
    expect(PRAYER_INTENSITY_CONFIG[0].legendBg).not.toContain('emerald');
  });

  it('legendBg for counts 1–5 all contain emerald', () => {
    ([1, 2, 3, 4, 5] as PrayerCount[]).forEach((c) => {
      expect(PRAYER_INTENSITY_CONFIG[c].legendBg).toContain('emerald');
    });
  });
});
