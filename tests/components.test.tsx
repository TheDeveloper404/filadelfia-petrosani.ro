import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EventCard from '../src/components/EventCard';
import MiniCalendar from '../src/components/MiniCalendar';
import Footer from '../src/components/Footer';
import Nav from '../src/components/Nav';
import LivePlayer from '../src/components/LivePlayer';

// ============================================================
// Helpers
// ============================================================
function withRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// ============================================================
// EventCard
// ============================================================
describe('EventCard', () => {
  const base = {
    id: 'e1',
    title: 'Paștele',
    date: '2026-04-12',
    endDate: '2026-04-13',
    time: '10:00',
    description: 'Sărbătoarea Învierii.',
  };

  it('renders title and description', () => {
    render(<EventCard {...base} />);
    expect(screen.getByText('Paștele')).toBeInTheDocument();
    expect(screen.getByText('Sărbătoarea Învierii.')).toBeInTheDocument();
  });

  it('renders the time when provided', () => {
    render(<EventCard {...base} />);
    expect(screen.getByText('10:00')).toBeInTheDocument();
  });

  it('does not render time when null', () => {
    render(<EventCard {...base} time={null} />);
    expect(screen.queryByText('10:00')).not.toBeInTheDocument();
  });


  it('shows date range for multi-day events', () => {
    render(<EventCard {...base} />);
    // Should contain both day numbers in formatted date
    const dateEl = screen.getByText(/12.+13/);
    expect(dateEl).toBeInTheDocument();
  });

  it('shows single date for one-day events', () => {
    render(<EventCard {...base} endDate={null} />);
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });
});

// ============================================================
// MiniCalendar
// ============================================================
describe('MiniCalendar', () => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0]!;

  it('renders day-of-week headers', () => {
    render(<MiniCalendar events={[]} />);
    expect(screen.getByText('Lu')).toBeInTheDocument();
    expect(screen.getByText('Du')).toBeInTheDocument();
  });

  it('renders the current month name', () => {
    render(<MiniCalendar events={[]} />);
    const months = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
                    'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
    expect(screen.getByText(new RegExp(months[today.getMonth()]!))).toBeInTheDocument();
  });

  it("highlights today's date", () => {
    render(<MiniCalendar events={[]} />);
    // Today's cell should have the orange bg class
    const todayCell = screen.getByText(String(today.getDate()), { selector: 'div' });
    expect(todayCell.className).toMatch(/bg-secondary/);
  });

  it('navigates to the previous month', () => {
    render(<MiniCalendar events={[]} />);
    const months = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
                    'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
    const prevMonth = (today.getMonth() + 11) % 12;
    fireEvent.click(screen.getByLabelText('Luna anterioară'));
    expect(screen.getByText(new RegExp(months[prevMonth]!))).toBeInTheDocument();
  });

  it('navigates to the next month', () => {
    render(<MiniCalendar events={[]} />);
    const months = ['Ianuarie','Februarie','Martie','Aprilie','Mai','Iunie',
                    'Iulie','August','Septembrie','Octombrie','Noiembrie','Decembrie'];
    const nextMonth = (today.getMonth() + 1) % 12;
    fireEvent.click(screen.getByLabelText('Luna următoare'));
    expect(screen.getByText(new RegExp(months[nextMonth]!))).toBeInTheDocument();
  });

  it('renders an event dot for a day with an event', () => {
    const { container } = render(<MiniCalendar events={[{ date: todayStr, title: 'Test' }]} />);
    // Event dot span should be present
    const dots = container.querySelectorAll('.rounded-full.bg-secondary, .rounded-full.bg-secondary-foreground\\/50');
    expect(dots.length).toBeGreaterThan(0);
  });
});

// ============================================================
// Footer
// ============================================================
describe('Footer', () => {
  it('renders the church name', () => {
    withRouter(<Footer />);
    expect(screen.getAllByText(/Filadelfia/i).length).toBeGreaterThan(0);
  });

  it('renders social media links', () => {
    withRouter(<Footer />);
    expect(screen.getByLabelText(/youtube/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
  });

  it('renders copyright notice', () => {
    withRouter(<Footer />);
    expect(screen.getByText(/toate drepturile rezervate/i)).toBeInTheDocument();
  });
});

// ============================================================
// Nav
// ============================================================
describe('Nav', () => {
  it('renders main nav links', () => {
    withRouter(<Nav />);
    expect(screen.getAllByRole('link', { name: /acasă/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^live$/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /plan biblic/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);
  });

});

// ============================================================
// LivePlayer
// ============================================================
describe('LivePlayer', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows a loading spinner while checking status', () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    const { container } = render(<LivePlayer />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('shows the last recorded video iframe when not live', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ isLive: false, videoId: null, title: null }),
    });
    render(<LivePlayer />);
    await waitFor(() => expect(screen.getByTitle(/ultimul program/i)).toBeInTheDocument());
  });

  it('shows the live iframe when the API reports a live broadcast', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      json: () => Promise.resolve({ isLive: true, videoId: 'abc123', title: 'Slujba de duminică' }),
    });
    render(<LivePlayer />);
    await waitFor(() => expect(screen.getByTitle(/transmisie live/i)).toBeInTheDocument());
  });

  it('falls back to the last recorded video when the status check fails', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network error'));
    render(<LivePlayer />);
    await waitFor(() => expect(screen.getByTitle(/ultimul program/i)).toBeInTheDocument());
  });
});
