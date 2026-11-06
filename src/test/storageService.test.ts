import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('manages current user id persistence correctly', () => {
    expect(storageService.getCurrentUserId()).toBeNull();

    storageService.setCurrentUserId('Ahmad');
    expect(storageService.getCurrentUserId()).toBe('Ahmad');

    const known = storageService.getKnownUsers();
    expect(known).toContain('Ahmad');

    storageService.clearCurrentUserId();
    expect(storageService.getCurrentUserId()).toBeNull();
  });

  it('updates today prayer record in-place without creating duplicates', () => {
    const user = 'Zaid';
    const date = '2026-11-04';

    // First submission today: 2 prayers
    storageService.saveRecord(user, date, 2);
    let all = storageService.getAllRecords(user);
    expect(Object.keys(all).length).toBe(1);
    expect(all[date].count).toBe(2);

    // Later the same day: update to 4 prayers
    storageService.saveRecord(user, date, 4);
    all = storageService.getAllRecords(user);
    expect(Object.keys(all).length).toBe(1); // Still exactly 1 record for this date
    expect(all[date].count).toBe(4);

    // Finally at night: update to 5 prayers
    storageService.saveRecord(user, date, 5);
    all = storageService.getAllRecords(user);
    expect(Object.keys(all).length).toBe(1);
    expect(all[date].count).toBe(5);
  });

  it('partitions records independently per user', () => {
    storageService.saveRecord('UserA', '2026-11-04', 3);
    storageService.saveRecord('UserB', '2026-11-04', 5);

    const recordsA = storageService.getAllRecords('UserA');
    const recordsB = storageService.getAllRecords('UserB');

    expect(recordsA['2026-11-04'].count).toBe(3);
    expect(recordsB['2026-11-04'].count).toBe(5);
  });
});
