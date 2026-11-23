import { AuthUser, IndividualPrayers, PrayerCount, PrayerRecord } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_KEY = 'salat_tracker_access_token';
const USER_KEY = 'salat_tracker_active_user';

export const apiService = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error saving access token:', e);
    }
  },

  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: AuthUser | null): void {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.error('Error saving user profile:', e);
    }
  },

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; errors?: unknown }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Needed for refresh token cookies
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `Request failed with status ${response.status}`,
          errors: json.errors,
        };
      }

      return json;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Network request failed';
      return {
        success: false,
        message: msg,
      };
    }
  },

  // ---------------- Authentication ---------------- //

  async register(username: string, email: string, password: string) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const res = await this.request<{ user: AuthUser; accessToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ username, email, password, timezone }),
      }
    );

    if (res.success && res.data) {
      this.setToken(res.data.accessToken);
      this.setCurrentUser(res.data.user);
    }

    return res;
  },

  async login(identifier: string, password: string) {
    const res = await this.request<{ user: AuthUser; accessToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }
    );

    if (res.success && res.data) {
      this.setToken(res.data.accessToken);
      this.setCurrentUser(res.data.user);
    }

    return res;
  },

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    this.setCurrentUser(null);
  },

  async checkAuth(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    const res = await this.request<AuthUser>('/auth/me');
    if (res.success && res.data) {
      this.setCurrentUser(res.data);
      return res.data;
    }

    // Try token refresh if access token expired
    const refreshRes = await this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
    if (refreshRes.success && refreshRes.data) {
      this.setToken(refreshRes.data.accessToken);
      const meRes = await this.request<AuthUser>('/auth/me');
      if (meRes.success && meRes.data) {
        this.setCurrentUser(meRes.data);
        return meRes.data;
      }
    }

    this.setToken(null);
    this.setCurrentUser(null);
    return null;
  },

  // ---------------- Prayer Records ---------------- //

  async getMonthlyRecords(month: string): Promise<Record<string, PrayerRecord>> {
    const res = await this.request<Record<string, PrayerRecord>>(
      `/prayers?month=${month}`
    );
    return res.data || {};
  },

  async savePrayer(
    date: string,
    count: PrayerCount,
    prayers?: Partial<IndividualPrayers>
  ): Promise<{ success: boolean; record?: PrayerRecord; message?: string }> {
    const body: Record<string, unknown> = {
      date,
      count,
      ...prayers,
    };

    const res = await this.request<PrayerRecord>('/prayers/today', {
      method: 'PUT',
      body: JSON.stringify(body),
    });

    return {
      success: res.success,
      record: res.data,
      message: res.message,
    };
  },
};
