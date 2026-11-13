import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarLegend } from '../components/CalendarLegend';

describe('CalendarLegend component', () => {
  it('renders without crashing', () => {
    render(<CalendarLegend />);
  });

  it('shows the "Salat Completed:" label', () => {
    render(<CalendarLegend />);
    expect(screen.getByText(/Salat Completed:/i)).toBeInTheDocument();
  });

  it('shows "0 to 5 daily prayers" description text', () => {
    render(<CalendarLegend />);
    expect(screen.getByText(/0 to 5 daily prayers/i)).toBeInTheDocument();
  });

  it('shows "None" and "All 5" range labels', () => {
    render(<CalendarLegend />);
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('All 5')).toBeInTheDocument();
  });

  it('renders 6 count boxes (0 through 5)', () => {
    render(<CalendarLegend />);
    // Each count box shows its number as text: 0, 1, 2, 3, 4, 5
    [0, 1, 2, 3, 4, 5].forEach((n) => {
      // Multiple elements may show a number; just verify at least one exists
      expect(screen.getAllByText(String(n)).length).toBeGreaterThan(0);
    });
  });
});
