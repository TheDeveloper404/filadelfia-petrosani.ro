import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomePage from '../src/pages/HomePage';
import LivePage from '../src/pages/LivePage';
import ContactPage from '../src/pages/ContactPage';
import ReadingPlanPage from '../src/pages/ReadingPlanPage';
import AdminPage from '../src/pages/AdminPage';

// ============================================================
// Helpers
// ============================================================
function renderPage(ui: React.ReactElement, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}

// Silence console.error from React Router / jsdom
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  HTMLElement.prototype.scrollBy = vi.fn();
});
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

// ============================================================
// HomePage
// ============================================================
describe('HomePage', () => {
  it('renders the church name in hero', () => {
    renderPage(<HomePage />);
    expect(screen.getAllByText(/filadelfia/i).length).toBeGreaterThan(0);
  });

  it('renders Program & Comunitate section', () => {
    renderPage(<HomePage />);
    expect(screen.getByText(/program & comunitate/i)).toBeInTheDocument();
  });

  it('renders Program săptămânal', () => {
    renderPage(<HomePage />);
    expect(screen.getByText(/program săptămânal/i)).toBeInTheDocument();
  });

  it('renders Evenimente section', () => {
    renderPage(<HomePage />);
    expect(screen.getByText(/evenimente/i)).toBeInTheDocument();
  });

  it('renders Calendar section', () => {
    renderPage(<HomePage />);
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });

  it('renders Urmărește Live CTA button', () => {
    renderPage(<HomePage />);
    expect(screen.getByRole('link', { name: /urmărește live/i })).toBeInTheDocument();
  });

  it('renders Plan Biblic CTA button', () => {
    renderPage(<HomePage />);
    expect(screen.getByRole('link', { name: /plan biblic/i })).toBeInTheDocument();
  });
});

// ============================================================
// LivePage
// ============================================================
describe('LivePage', () => {
  it('renders the page heading', () => {
    renderPage(<LivePage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the last recorded video section', () => {
    renderPage(<LivePage />);
    expect(screen.getByText(/ultimul program înregistrat/i)).toBeInTheDocument();
  });
});

// ============================================================
// ContactPage
// ============================================================
describe('ContactPage', () => {
  it('renders the page', () => {
    renderPage(<ContactPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the address', () => {
    renderPage(<ContactPage />);
    expect(screen.getByText(/petroșani/i)).toBeInTheDocument();
  });

  it('renders pastor name', () => {
    renderPage(<ContactPage />);
    expect(screen.getByText(/gheorghe coicheci/i)).toBeInTheDocument();
  });

  it('renders the map iframe', () => {
    renderPage(<ContactPage />);
    expect(screen.getByTitle(/hartă/i)).toBeInTheDocument();
  });
});

// ============================================================
// ReadingPlanPage
// ============================================================
describe('ReadingPlanPage', () => {
  it('renders the page heading', () => {
    renderPage(<ReadingPlanPage />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the scroll-to-today button', () => {
    renderPage(<ReadingPlanPage />);
    expect(screen.getByRole('button', { name: /mergi la ziua de azi/i })).toBeInTheDocument();
  });

  it('renders reading plan rows', () => {
    renderPage(<ReadingPlanPage />);
    // Should render multiple day rows
    const rows = screen.getAllByText(/geneza|matei|psalmul|marcu|luca|fapte/i);
    expect(rows.length).toBeGreaterThan(0);
  });
});

// ============================================================
// AdminPage
// ============================================================
describe('AdminPage', () => {
  beforeEach(() => {
    // Simulate already-unlocked session so PIN screen is bypassed
    sessionStorage.setItem('filadelfia_admin_unlocked', '1');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('renders admin heading', () => {
    renderPage(<AdminPage />);
    expect(screen.getByText(/administrator/i)).toBeInTheDocument();
  });

  it('renders events section', () => {
    renderPage(<AdminPage />);
    expect(screen.getAllByText(/evenimente/i).length).toBeGreaterThan(0);
  });

  it('shows PIN screen when not unlocked', () => {
    sessionStorage.clear();
    renderPage(<AdminPage />);
    expect(screen.getByText(/introdu codul de acces/i)).toBeInTheDocument();
  });
});
