import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiService } from '../services/apiService';

describe('apiService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('manages token in localStorage correctly', () => {
    expect(apiService.getToken()).toBeNull();
    apiService.setToken('test_token_123');
    expect(apiService.getToken()).toBe('test_token_123');
    apiService.setToken(null);
    expect(apiService.getToken()).toBeNull();
  });

  it('manages current user in localStorage correctly', () => {
    expect(apiService.getCurrentUser()).toBeNull();
    apiService.setCurrentUser({
      id: 'u-1',
      username: 'tariq',
      email: 'tariq@example.com',
    });
    expect(apiService.getCurrentUser()?.username).toBe('tariq');
    apiService.setCurrentUser(null);
    expect(apiService.getCurrentUser()).toBeNull();
  });

  it('executes successful registration and saves token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: { id: 'u-1', username: 'brother', email: 'b@example.com' },
          accessToken: 'jwt_access_token',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await apiService.register('brother', 'b@example.com', 'Pass123!');
    expect(res.success).toBe(true);
    expect(apiService.getToken()).toBe('jwt_access_token');
    expect(apiService.getCurrentUser()?.username).toBe('brother');
  });

  it('executes successful login and saves token', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          user: { id: 'u-2', username: 'sister', email: 's@example.com' },
          accessToken: 'jwt_access_token_2',
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await apiService.login('sister', 'Pass123!');
    expect(res.success).toBe(true);
    expect(apiService.getToken()).toBe('jwt_access_token_2');
    expect(apiService.getCurrentUser()?.username).toBe('sister');
  });

  it('executes logout and clears token', async () => {
    apiService.setToken('some_token');
    apiService.setCurrentUser({ id: 'u-1', username: 'a', email: 'a@a.com' });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiService.logout();
    expect(apiService.getToken()).toBeNull();
    expect(apiService.getCurrentUser()).toBeNull();
  });

  it('fetches monthly records', async () => {
    const mockRecords = {
      '2026-11-24': { date: '2026-11-24', count: 5, updatedAt: new Date().toISOString() },
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockRecords }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const records = await apiService.getMonthlyRecords('2026-11');
    expect(records['2026-11-24'].count).toBe(5);
  });

  it('saves prayer record', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { date: '2026-11-24', count: 3 },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await apiService.savePrayer('2026-11-24', 3, { fajr: true, dhuhr: true, asr: true });
    expect(res.success).toBe(true);
    expect(res.record?.count).toBe(3);
  });
});
