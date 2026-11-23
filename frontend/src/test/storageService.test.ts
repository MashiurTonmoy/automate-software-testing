import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── User ID persistence ───────────────────────────────────────────
  describe('getCurrentUserId / setCurrentUserId / clearCurrentUserId', () => {
    it('returns null when no user is set', () => {
      expect(storageService.getCurrentUserId()).toBeNull();
    });

    it('persists and retrieves a user ID correctly', () => {
      storageService.setCurrentUserId('Ahmad');
      expect(storageService.getCurrentUserId()).toBe('Ahmad');
    });

    it('trims whitespace from user ID on set and get', () => {
      storageService.setCurrentUserId('  Zaid  ');
      expect(storageService.getCurrentUserId()).toBe('Zaid');
    });

    it('does not store an empty or whitespace-only user ID', () => {
      storageService.setCurrentUserId('   ');
      expect(storageService.getCurrentUserId()).toBeNull();
    });

    it('clears the current user ID', () => {
      storageService.setCurrentUserId('Ahmad');
      storageService.clearCurrentUserId();
      expect(storageService.getCurrentUserId()).toBeNull();
    });
  });

  // ── Known users index ─────────────────────────────────────────────
  describe('getKnownUsers', () => {
    it('returns empty array when no users registered', () => {
      expect(storageService.getKnownUsers()).toEqual([]);
    });

    it('adds user to known users list on first setCurrentUserId', () => {
      storageService.setCurrentUserId('Bilal');
      expect(storageService.getKnownUsers()).toContain('Bilal');
    });

    it('does not duplicate a user already in the known list', () => {
      storageService.setCurrentUserId('Bilal');
      storageService.setCurrentUserId('Bilal');
      const users = storageService.getKnownUsers();
      expect(users.filter(u => u === 'Bilal').length).toBe(1);
    });

    it('accumulates multiple distinct users', () => {
      storageService.setCurrentUserId('UserA');
      storageService.setCurrentUserId('UserB');
      const users = storageService.getKnownUsers();
      expect(users).toContain('UserA');
      expect(users).toContain('UserB');
    });
  });

  // ── saveRecord / getRecord / getAllRecords ────────────────────────
  describe('saveRecord / getRecord / getAllRecords', () => {
    it('saves a new prayer record and retrieves it', () => {
      storageService.saveRecord('Zaid', '2026-11-04', 3);
      const record = storageService.getRecord('Zaid', '2026-11-04');
      expect(record).not.toBeNull();
      expect(record!.count).toBe(3);
      expect(record!.date).toBe('2026-11-04');
    });

    it('updates an existing record for the same date without creating duplicates', () => {
      storageService.saveRecord('Zaid', '2026-11-04', 2);
      storageService.saveRecord('Zaid', '2026-11-04', 4);
      storageService.saveRecord('Zaid', '2026-11-04', 5);

      const all = storageService.getAllRecords('Zaid');
      expect(Object.keys(all).length).toBe(1);
      expect(all['2026-11-04'].count).toBe(5);
    });

    it('accumulates records across different dates', () => {
      storageService.saveRecord('Zaid', '2026-11-01', 5);
      storageService.saveRecord('Zaid', '2026-11-02', 3);
      storageService.saveRecord('Zaid', '2026-11-03', 1);

      const all = storageService.getAllRecords('Zaid');
      expect(Object.keys(all).length).toBe(3);
      expect(all['2026-11-01'].count).toBe(5);
      expect(all['2026-11-02'].count).toBe(3);
      expect(all['2026-11-03'].count).toBe(1);
    });

    it('partitions records independently per user (no cross-contamination)', () => {
      storageService.saveRecord('UserA', '2026-11-04', 3);
      storageService.saveRecord('UserB', '2026-11-04', 5);

      const recordsA = storageService.getAllRecords('UserA');
      const recordsB = storageService.getAllRecords('UserB');

      expect(recordsA['2026-11-04'].count).toBe(3);
      expect(recordsB['2026-11-04'].count).toBe(5);
      expect(Object.keys(recordsA).length).toBe(1);
      expect(Object.keys(recordsB).length).toBe(1);
    });

    it('returns null for a date with no record', () => {
      expect(storageService.getRecord('Zaid', '2099-01-01')).toBeNull();
    });

    it('returns empty object from getAllRecords for user with no data', () => {
      expect(storageService.getAllRecords('NonExistentUser')).toEqual({});
    });

    it('handles corrupted localStorage JSON gracefully (returns empty)', () => {
      localStorage.setItem('salat_tracker_records_corrupt', 'NOT_VALID_JSON{{{');
      const records = storageService.getAllRecords('corrupt');
      expect(records).toEqual({});
    });

    it('savedRecord includes updatedAt ISO timestamp', () => {
      const record = storageService.saveRecord('Zaid', '2026-11-04', 5);
      expect(record.updatedAt).toBeDefined();
      expect(() => new Date(record.updatedAt)).not.toThrow();
    });
  });
});
