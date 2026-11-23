import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { storageService } from '../services/storageService';

describe('Salat Tracker – App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ── 1. Auth Modal ─────────────────────────────────────────────────
  describe('User identification modal', () => {
    it('shows welcome modal on first visit', () => {
      render(<App />);
      expect(screen.getByText('Welcome to Salat Tracker')).toBeInTheDocument();
      expect(screen.getByLabelText(/Enter your Name or User ID/i)).toBeInTheDocument();
    });

    it('shows validation error when submitting empty name', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /Start Tracking/i }));
      expect(screen.getByText('Please enter a valid name or username.')).toBeInTheDocument();
    });

    it('shows validation error when submitting whitespace-only name', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.type(screen.getByLabelText(/Enter your Name or User ID/i), '   ');
      await user.click(screen.getByRole('button', { name: /Start Tracking/i }));
      expect(screen.getByText('Please enter a valid name or username.')).toBeInTheDocument();
    });

    it('closes modal and shows user ID in header after valid name entry', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.type(screen.getByLabelText(/Enter your Name or User ID/i), 'Zaid');
      await user.click(screen.getByRole('button', { name: /Start Tracking/i }));

      await waitFor(() => {
        expect(screen.queryByText('Welcome to Salat Tracker')).not.toBeInTheDocument();
      });

      expect(storageService.getCurrentUserId()).toBe('Zaid');
      expect(screen.getAllByText('Zaid').length).toBeGreaterThan(0);
    });

    it('skips modal when a user is already stored in localStorage', () => {
      storageService.setCurrentUserId('Ahmad');
      render(<App />);
      expect(screen.queryByText('Welcome to Salat Tracker')).not.toBeInTheDocument();
    });
  });

  // ── 2. Prayer count submission (today) ────────────────────────────
  describe('Today prayer submission', () => {
    beforeEach(() => {
      storageService.setCurrentUserId('Zaid');
    });

    it('shows "Today (Active & Editable)" section on load', () => {
      render(<App />);
      expect(screen.getByText(/Today \(Active & Editable\)/i)).toBeInTheDocument();
    });

    it('submits 3 prayers and shows success message', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /Select 3 prayers/i }));
      await user.click(screen.getByRole('button', { name: /Submit Today's Record/i }));

      await waitFor(() => {
        expect(screen.getByText(/Today's record updated to 3 of 5 Salat/i)).toBeInTheDocument();
      });
    });

    it('updates same day record from 3 to 5 prayers', async () => {
      const user = userEvent.setup();
      render(<App />);

      // First submission: 3 prayers
      await user.click(screen.getByRole('button', { name: /Select 3 prayers/i }));
      await user.click(screen.getByRole('button', { name: /Submit Today's Record/i }));
      await waitFor(() => {
        expect(screen.getByText(/Today's record updated to 3 of 5 Salat/i)).toBeInTheDocument();
      });

      // Update to 5 prayers
      await user.click(screen.getByRole('button', { name: /Select 5 prayers/i }));
      await user.click(screen.getByRole('button', { name: /Update Today's Record/i }));
      await waitFor(() => {
        expect(screen.getByText(/Today's record updated to 5 of 5 Salat/i)).toBeInTheDocument();
      });
    });

    it('persists submitted prayer count to storageService', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /Select 5 prayers/i }));
      await user.click(screen.getByRole('button', { name: /Submit Today's Record/i }));

      await waitFor(() => {
        expect(screen.getByText(/Today's record updated to 5 of 5 Salat/i)).toBeInTheDocument();
      });

      const { getTodayKey } = await import('../utils/dateUtils');
      const record = storageService.getRecord('zaid', getTodayKey());
      expect(record).not.toBeNull();
      expect(record!.count).toBe(5);
    });
  });

  // ── 3. Past date read-only protection ────────────────────────────
  describe('Past date – read-only enforcement', () => {
    it('shows read-only notice when clicking a past date', async () => {
      storageService.setCurrentUserId('Zaid');
      storageService.saveRecord('Zaid', '2026-11-01', 4);
      const user = userEvent.setup();
      render(<App />);

      const day1Btn = screen.getByRole('button', { name: /Date 2026-11-01/i });
      await user.click(day1Btn);

      await waitFor(() => {
        expect(screen.getByText(/Historical Record \(Read-Only\)/i)).toBeInTheDocument();
        expect(screen.getByText(/Previous dates cannot be modified or resubmitted/i)).toBeInTheDocument();
      });
    });

    it('does not render any submit button for past dates', async () => {
      storageService.setCurrentUserId('Zaid');
      storageService.saveRecord('Zaid', '2026-11-01', 4);
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole('button', { name: /Date 2026-11-01/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Submit Today's Record/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Update Today's Record/i })).not.toBeInTheDocument();
      });
    });
  });

  // ── 4. Future date disabled ───────────────────────────────────────
  describe('Future date – disabled enforcement', () => {
    it('future date calendar button is disabled', () => {
      storageService.setCurrentUserId('Zaid');
      render(<App />);

      const futureBtn = screen.getByRole('button', { name: /Date 2026-11-25 \(Future - Disabled\)/i });
      expect(futureBtn).toBeDisabled();
    });

    it('clicking disabled future date keeps "Today" panel active', async () => {
      storageService.setCurrentUserId('Zaid');
      const user = userEvent.setup();
      render(<App />);

      const futureBtn = screen.getByRole('button', { name: /Date 2026-11-25 \(Future - Disabled\)/i });
      await user.click(futureBtn);

      expect(screen.getByText(/Today \(Active & Editable\)/i)).toBeInTheDocument();
    });
  });

  // ── 5. User switching ─────────────────────────────────────────────
  describe('User switching', () => {
    it('shows user auth modal again after switching user', async () => {
      storageService.setCurrentUserId('Zaid');
      const user = userEvent.setup();
      render(<App />);

      const switchBtn = screen.getByRole('button', { name: /Switch User/i });
      await user.click(switchBtn);

      // Modal reappears (may show "Welcome to Salat Tracker" or "Switch User Account")
      await waitFor(() => {
        expect(screen.getByLabelText(/Enter your Name or User ID/i)).toBeInTheDocument();
      });
    });

    it('shows user ID input field after switching user (ready for new login)', async () => {
      storageService.setCurrentUserId('Zaid');
      const user = userEvent.setup();
      render(<App />);

      const switchBtn = screen.getByRole('button', { name: /Switch User/i });
      await user.click(switchBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Switch to this User/i })).toBeInTheDocument();
      });
    });
  });
});
