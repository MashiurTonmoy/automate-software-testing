import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserAuthModal } from '../components/UserAuthModal';
import { apiService } from '../services/apiService';

describe('UserAuthModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('switches between Sign In and Create Account tabs', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <UserAuthModal
        currentUserId={null}
        knownUsers={[]}
        onSubmit={handleSubmit}
      />
    );

    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();

    // Click Create Account tab
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('submits registration with API when password is provided', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    vi.spyOn(apiService, 'register').mockResolvedValue({
      success: true,
      data: {
        user: { id: 'u-1', username: 'newuser', email: 'new@example.com' },
        accessToken: 'token123',
      },
    });

    render(
      <UserAuthModal
        currentUserId={null}
        knownUsers={[]}
        onSubmit={handleSubmit}
      />
    );

    // Switch to register tab
    const tabs = screen.getAllByRole('button', { name: 'Create Account' });
    await user.click(tabs[0]);
    await user.type(screen.getByLabelText(/Username/i), 'newuser');
    await user.type(screen.getByLabelText(/Email Address/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'Secret123');

    // Submit
    const submitBtns = screen.getAllByRole('button', { name: /Create Account/i });
    const submitBtn = submitBtns[submitBtns.length - 1];
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith('newuser', 'new@example.com');
    });
  });

  it('handles API login failure with an error message', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    vi.spyOn(apiService, 'login').mockResolvedValue({
      success: false,
      message: 'Invalid username or password',
    });

    render(
      <UserAuthModal
        currentUserId={null}
        knownUsers={[]}
        onSubmit={handleSubmit}
      />
    );

    await user.type(screen.getByLabelText(/Enter your Name or User ID/i), 'tariq');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpass');

    const submitBtn = screen.getByRole('button', { name: /Start Tracking/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
