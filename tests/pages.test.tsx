import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import HomePage from '../src/pages/HomePage';
import LivePage from '../src/pages/LivePage';
import ContactPage from '../src/pages/ContactPage';
import StiriPage from '../src/pages/StiriPage';
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
    expect(screen.getByText(/filadelfia/i)).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderPage(<HomePage />);
    expect(screen.getByText(/un loc al întâlnirii cu Dumnezeu/i)).toBeInTheDocument();
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

  it('renders Programul serviciilor section', () => {
    renderPage(<LivePage />);
    expect(screen.getAllByText(/programul serviciilor/i).length).toBeGreaterThan(0);
  });

  it('renders schedule service items', () => {
    renderPage(<LivePage />);
    expect(screen.getAllByText(/duminică/i).length).toBeGreaterThan(0);
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

  it('renders the Astăzi button', () => {
    renderPage(<ReadingPlanPage />);
    expect(screen.getByRole('button', { name: /astăzi/i })).toBeInTheDocument();
  });

  it('renders reading plan rows', () => {
    renderPage(<ReadingPlanPage />);
    // Should render multiple day rows
    const rows = screen.getAllByText(/geneza|matei|psalmul|marcu|luca|fapte/i);
    expect(rows.length).toBeGreaterThan(0);
  });
});

// ============================================================
// StiriPage
// ============================================================
describe('StiriPage', () => {
  beforeEach(() => localStorage.clear());

  it('shows loading spinner initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    renderPage(<StiriPage />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders articles after successful fetch', async () => {
    const mockArticles = [
      {
        id: 1,
        title: { rendered: 'Articol de test' },
        date: '2026-03-31T09:00:00',
        link: 'https://crestintotal.ro/articol-1',
        excerpt: { rendered: '<p>Descriere scurtă a articolului.</p>' },
        jetpack_featured_media_url: '',
      },
    ];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockArticles,
    }) as unknown as typeof fetch;

    renderPage(<StiriPage />);
    await waitFor(() => screen.getByText('Articol de test'));
    expect(screen.getByText('Articol de test')).toBeInTheDocument();
    expect(screen.getByText(/descriere scurtă/i)).toBeInTheDocument();
  });

  it('shows error message when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as unknown as typeof fetch;
    renderPage(<StiriPage />);
    await waitFor(() => screen.getByText(/nu pot fi încărcate/i));
    expect(screen.getByText(/nu pot fi încărcate/i)).toBeInTheDocument();
  });

  it('shows error when API returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
    renderPage(<StiriPage />);
    await waitFor(() => screen.getByText(/nu pot fi încărcate/i));
    expect(screen.getByText(/nu pot fi încărcate/i)).toBeInTheDocument();
  });

  it('uses cached articles from localStorage', async () => {
    const cached = {
      timestamp: Date.now(),
      articles: [
        {
          id: 99,
          title: { rendered: 'Din cache' },
          date: '2026-01-01T00:00:00',
          link: 'https://example.com',
          excerpt: { rendered: '<p>Conținut din cache.</p>' },
          jetpack_featured_media_url: '',
        },
      ],
    };
    localStorage.setItem('filadelfia_stiri_cache', JSON.stringify(cached));
    global.fetch = vi.fn() as unknown as typeof fetch;

    renderPage(<StiriPage />);
    await waitFor(() => screen.getByText('Din cache'));
    expect(screen.getByText('Din cache')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
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

  it('renders ticker form fields', () => {
    renderPage(<AdminPage />);
    expect(screen.getByText(/bandă de știri/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salvează/i })).toBeInTheDocument();
  });

  it('saves ticker config to localStorage on save', () => {
    renderPage(<AdminPage />);
    const saveBtn = screen.getByRole('button', { name: /salvează/i });
    fireEvent.click(saveBtn);
    const stored = localStorage.getItem('filadelfia_ticker');
    expect(stored).not.toBeNull();
  });

  it('shows PIN screen when not unlocked', () => {
    sessionStorage.clear();
    renderPage(<AdminPage />);
    expect(screen.getByText(/introdu codul de acces/i)).toBeInTheDocument();
  });
});
