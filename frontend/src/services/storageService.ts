import { IndividualPrayers, PrayerCount, PrayerRecord } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'salat_tracker_current_user',
  USERS_LIST: 'salat_tracker_users_index',
  RECORDS_PREFIX: 'salat_tracker_records_',
};

/**
 * Storage service abstracting persistence and local cache.
 */
export const storageService = {
  /**
   * Get the currently active user ID / username
   */
  getCurrentUserId(): string | null {
    try {
      const id = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return id ? id.trim() : null;
    } catch {
      return null;
    }
  },

  /**
   * Set the active user ID and ensure it is saved in the known users index
   */
  setCurrentUserId(userId: string): void {
    const cleanId = userId.trim();
    if (!cleanId) return;

    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, cleanId);

      // Update list of registered users
      const users = this.getKnownUsers();
      if (!users.includes(cleanId)) {
        users.push(cleanId);
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(users));
      }
    } catch (e) {
      console.error('Failed to save user ID to localStorage:', e);
    }
  },

  /**
   * Clear the active user ID (sign out / switch user)
   */
  clearCurrentUserId(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch (e) {
      console.error('Failed to clear user ID from localStorage:', e);
    }
  },

  /**
   * Get all registered users on this device
   */
  getKnownUsers(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get all prayer records for a specific user
   */
  getAllRecords(userId: string): Record<string, PrayerRecord> {
    const cleanId = userId.trim().toLowerCase();
    if (!cleanId) return {};

    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.RECORDS_PREFIX}${cleanId}`);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load prayer records from localStorage:', e);
      return {};
    }
  },

  /**
   * Set entire records map in storage
   */
  setAllRecords(userId: string, records: Record<string, PrayerRecord>): void {
    const cleanId = userId.trim().toLowerCase();
    if (!cleanId) return;
    try {
      localStorage.setItem(
        `${STORAGE_KEYS.RECORDS_PREFIX}${cleanId}`,
        JSON.stringify(records)
      );
    } catch (e) {
      console.error('Failed to save records map to localStorage:', e);
    }
  },

  /**
   * Get prayer record for a single date for a user
   */
  getRecord(userId: string, dateKey: string): PrayerRecord | null {
    const records = this.getAllRecords(userId);
    return records[dateKey] || null;
  },

  /**
   * Save or update prayer record for a date for a user.
   * Supports both total count and individual prayer breakdown.
   */
  saveRecord(
    userId: string,
    dateKey: string,
    count: PrayerCount,
    prayers?: Partial<IndividualPrayers>
  ): PrayerRecord {
    const cleanId = userId.trim().toLowerCase();
    const records = this.getAllRecords(userId);

    const fajr = prayers?.fajr ?? (count >= 1);
    const dhuhr = prayers?.dhuhr ?? (count >= 2);
    const asr = prayers?.asr ?? (count >= 3);
    const maghrib = prayers?.maghrib ?? (count >= 4);
    const isha = prayers?.isha ?? (count >= 5);

    const updatedRecord: PrayerRecord = {
      date: dateKey,
      count,
      fajr,
      dhuhr,
      asr,
      maghrib,
      isha,
      updatedAt: new Date().toISOString(),
    };

    records[dateKey] = updatedRecord;

    try {
      localStorage.setItem(
        `${STORAGE_KEYS.RECORDS_PREFIX}${cleanId}`,
        JSON.stringify(records)
      );
    } catch (e) {
      console.error('Failed to save prayer record to localStorage:', e);
    }

    return updatedRecord;
  },
};
