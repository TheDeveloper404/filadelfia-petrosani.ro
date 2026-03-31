import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EventCard from '../src/components/EventCard';
import MiniCalendar from '../src/components/MiniCalendar';
import NewsTicker from '../src/components/NewsTicker';
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
    registrationUrl: null,
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

  it('renders registration link when provided', () => {
    render(<EventCard {...base} registrationUrl="https://example.com" />);
    expect(screen.getByRole('link', { name: /înregistrare/i })).toHaveAttribute('href', 'https://example.com');
  });

  it('does not render registration link when null', () => {
    render(<EventCard {...base} />);
    expect(screen.queryByRole('link', { name: /înregistrare/i })).not.toBeInTheDocument();
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
// NewsTicker
// ============================================================
describe('NewsTicker', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('renders text from site-config when no localStorage override', () => {
    render(<NewsTicker />);
    // The ticker text from site-config should be present (at least one copy)
    const spans = document.querySelectorAll('.ticker-content');
    expect(spans.length).toBeGreaterThan(0);
  });

  it('renders the localStorage override text', () => {
    localStorage.setItem('filadelfia_ticker', JSON.stringify({ enabled: true, text: 'Test ticker text' }));
    render(<NewsTicker />);
    expect(screen.getAllByText('Test ticker text').length).toBeGreaterThan(0);
  });

  it('renders nothing when disabled via localStorage', () => {
    localStorage.setItem('filadelfia_ticker', JSON.stringify({ enabled: false, text: 'Hidden' }));
    const { container } = render(<NewsTicker />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when text is empty', () => {
    localStorage.setItem('filadelfia_ticker', JSON.stringify({ enabled: true, text: '' }));
    const { container } = render(<NewsTicker />);
    expect(container.firstChild).toBeNull();
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

  it('renders page links', () => {
    withRouter(<Footer />);
    expect(screen.getByRole('link', { name: /acasă/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /live/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders social media links', () => {
    withRouter(<Footer />);
    expect(screen.getByLabelText('youtube')).toBeInTheDocument();
    expect(screen.getByLabelText('facebook')).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: /acasă/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^live$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /plan biblic/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders Arhivă as a clickable element', () => {
    withRouter(<Nav />);
    expect(screen.getByText(/arhivă/i)).toBeInTheDocument();
  });

  it('shows popup when Arhivă is clicked', () => {
    withRouter(<Nav />);
    fireEvent.click(screen.getByText(/arhivă/i));
    expect(screen.getByText(/arhivă predici/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deschide youtube/i })).toBeInTheDocument();
  });

  it('closes popup when Anulează is clicked', () => {
    withRouter(<Nav />);
    fireEvent.click(screen.getByText(/arhivă/i));
    fireEvent.click(screen.getByRole('button', { name: /anulează/i }));
    expect(screen.queryByText(/arhivă predici/i)).not.toBeInTheDocument();
  });
});

// ============================================================
// LivePlayer
// ============================================================
describe('LivePlayer', () => {
  it('shows offline message outside service windows', () => {
    // Monday 12:00 — no service
    vi.setSystemTime(new Date('2026-03-30T12:00:00'));
    render(<LivePlayer />);
    expect(screen.getByText(/momentan nu este transmisie live/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows live iframe during Sunday morning service', () => {
    // Sunday 10:00 — inside 09:00–13:00 window
    vi.setSystemTime(new Date('2026-03-29T10:00:00'));
    render(<LivePlayer />);
    expect(screen.getByTitle(/transmisie live/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows live iframe during Thursday evening service', () => {
    // Thursday 19:00 — inside 18:00–21:00 window
    vi.setSystemTime(new Date('2026-04-02T19:00:00'));
    render(<LivePlayer />);
    expect(screen.getByTitle(/transmisie live/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows subscribe link when offline', () => {
    vi.setSystemTime(new Date('2026-03-30T12:00:00'));
    render(<LivePlayer />);
    expect(screen.getByRole('link', { name: /abonează-te/i })).toBeInTheDocument();
    vi.useRealTimers();
  });
});
