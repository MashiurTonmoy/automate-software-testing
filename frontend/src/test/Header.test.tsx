import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../components/Header';

// Mock dateUtils to have stable date values in tests
vi.mock('../utils/dateUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/dateUtils')>();
  return {
    ...actual,
    getTodayKey: () => '2026-11-13',
    formatFriendlyDate: () => 'Friday, Nov 13, 2026',
  };
});

describe('Header component', () => {
  const defaultProps = {
    userId: 'TestUser',
    onSwitchUser: vi.fn(),
  };

  it('renders the app title "Salat Tracker"', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText('Salat Tracker')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/Daily Prayer Log/i)).toBeInTheDocument();
  });

  it('displays the current user ID', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByTitle('TestUser')).toBeInTheDocument();
  });

  it('renders the Switch User button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Switch User/i })).toBeInTheDocument();
  });

  it('calls onSwitchUser when Switch User button is clicked', async () => {
    const user = userEvent.setup();
    const onSwitchUser = vi.fn();
    render(<Header userId="TestUser" onSwitchUser={onSwitchUser} />);

    await user.click(screen.getByRole('button', { name: /Switch User/i }));
    expect(onSwitchUser).toHaveBeenCalledOnce();
  });

  it('shows the formatted today date', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/Today:/i)).toBeInTheDocument();
  });
});
