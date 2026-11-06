import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { storageService } from '../services/storageService';

describe('Salat Tracker App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prompts user identification on first visit and persists User ID', async () => {
    render(<App />);

    // Check modal prompt
    expect(screen.getByText('Welcome to Salat Tracker')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Enter your Name or User ID/i)
    ).toBeInTheDocument();

    const input = screen.getByLabelText(/Enter your Name or User ID/i);
    const submitBtn = screen.getByRole('button', { name: /Start Tracking/i });

    // Try submitting empty
    fireEvent.click(submitBtn);
    expect(
      screen.getByText('Please enter a valid name or username.')
    ).toBeInTheDocument();

    // Enter name "Zaid"
    fireEvent.change(input, { target: { value: 'Zaid' } });
    fireEvent.click(submitBtn);

    // Modal closes and User ID is displayed in header
    await waitFor(() => {
      expect(screen.queryByText('Welcome to Salat Tracker')).not.toBeInTheDocument();
    });

    expect(storageService.getCurrentUserId()).toBe('Zaid');
    expect(screen.getAllByText('Zaid').length).toBeGreaterThan(0);
  });

  it('allows submitting and repeatedly updating today\'s prayer count', async () => {
    storageService.setCurrentUserId('Zaid');
    render(<App />);

    // Verify today's section is active
    expect(screen.getByText(/Today \(Active & Editable\)/i)).toBeInTheDocument();

    // Select 3 prayers
    const count3Btn = screen.getByRole('button', { name: /Select 3 prayers/i });
    fireEvent.click(count3Btn);

    const submitBtn = screen.getByRole('button', { name: /Submit Today's Record/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Today's record updated to 3 of 5 Salat/i)).toBeInTheDocument();
    });

    // Update again to 5 prayers later the same day
    const count5Btn = screen.getByRole('button', { name: /Select 5 prayers/i });
    fireEvent.click(count5Btn);

    const updateBtn = screen.getByRole('button', { name: /Update Today's Record/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Today's record updated to 5 of 5 Salat/i)).toBeInTheDocument();
    });
  });

  it('disallows modifying records for past dates', async () => {
    storageService.setCurrentUserId('Zaid');
    // Pre-seed a past record
    storageService.saveRecord('Zaid', '2026-11-01', 4);

    render(<App />);

    // Find the cell for day 1
    const day1Btn = screen.getByRole('button', { name: /Date 2026-11-01/i });
    fireEvent.click(day1Btn);

    // Verify read-only status
    await waitFor(() => {
      expect(screen.getByText(/Historical Record \(Read-Only\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Previous dates cannot be modified or resubmitted/i)).toBeInTheDocument();
    });

    // No submit button should exist for past dates
    expect(screen.queryByRole('button', { name: /Submit Today's Record/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Update Today's Record/i })).not.toBeInTheDocument();
  });

  it('strictly disables future dates so they cannot be selected or submitted', async () => {
    storageService.setCurrentUserId('Zaid');
    render(<App />);

    // Suppose today is Nov 4, 2026. A future date like Nov 25, 2026 should be disabled
    const futureBtn = screen.getByRole('button', { name: /Date 2026-11-25 \(Future - Disabled\)/i });
    expect(futureBtn).toBeDisabled();

    // Clicking it should not change selected date to future date
    fireEvent.click(futureBtn);

    // Selected date should remain today
    expect(screen.getByText(/Today \(Active & Editable\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Future Date Cannot Be Selected/i)).not.toBeInTheDocument();
  });
});
