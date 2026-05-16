import { useState, useEffect, startTransition } from 'react';
import { createPortal } from 'react-dom';
import Container from '@/components/ui/container';
import PageMeta from '@/components/PageMeta';
import { WaveDivider } from '@/components/WaveDivider';

const CATEGORY_SLUG = 'anunturi';
const CACHE_KEY = 'filadelfia_articole_anunturi_cache';
const CACHE_TTL = 2 * 60 * 60 * 1000;

interface Article {
  id: number;
  title: { rendered: string };
  date: string;
  link: string;
  excerpt: { rendered: string };
  jetpack_featured_media_url: string;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent ?? tmp.innerText ?? '').replace(/\s+/g, ' ').trim();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const { timestamp, articles } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_TTL) return articles;
    }
  } catch { /* ignore */ }

  const catRes = await fetch(`https://crestintotal.ro/wp-json/wp/v2/categories?slug=${CATEGORY_SLUG}`);
  if (!catRes.ok) throw new Error(`HTTP ${catRes.status}`);
  const cats = await catRes.json();
  if (!cats.length) throw new Error('Category not found');
  const categoryId: number = cats[0].id;

  const res = await fetch(
    `https://crestintotal.ro/wp-json/wp/v2/posts?categories=${categoryId}&per_page=4&orderby=date&order=desc&_fields=id,title,date,link,excerpt,jetpack_featured_media_url`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const articles: Article[] = await res.json();
  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), articles }));
  return articles;
}

export default function StiriPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchArticles()
      .then(data => startTransition(() => setArticles(data)))
      .catch(() => setError('Articolele nu pot fi încărcate momentan. Încearcă din nou mai târziu.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageMeta title="Articole — Filadelfia" description="Articole și anunțuri creștine de la crestintotal.ro" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Actualitate creștină
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>Articole</h1>
          <p className="mx-auto mt-4 max-w-lg text-xl leading-8 text-slate-300">
            Ultimele articole de la{' '}
            <a href="https://crestintotal.ro" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
              crestintotal.ro
            </a>
          </p>
        </Container>
      </section>
      {/* Content */}
      <section className="relative py-20 bg-[#d4ab84] sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 -translate-y-full">
          <WaveDivider bottomColor="#d4ab84" height={70} />
        </div>
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
            <p className="mt-3 text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>CITEȘTE ACUM</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Cele mai recente articole din lumea creștină</h2>
            </div>

            <div className="p-4 sm:p-10">
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90 shadow-md shadow-secondary/20"
                >
                  Vezi toate articolele pe crestintotal.ro
                </button>
              </div>
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
                </div>
              )}

              {error && !loading && (
                <div className="rounded-2xl bg-slate-50 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-500">{error}</p>
                  <a
                    href="https://crestintotal.ro/category/anunturi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
                  >
                    Deschide crestintotal.ro
                  </a>
                </div>
              )}

              {!loading && !error && articles.length === 0 && (
                <div className="rounded-2xl bg-slate-50 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-500">Niciun articol disponibil momentan.</p>
                </div>
              )}

              {!loading && articles.length > 0 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {articles.map(article => (
                      <a
                        key={article.id}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:border-secondary/30 hover:shadow-md"
                      >
                        {article.jetpack_featured_media_url && (
                          <div className="h-80 overflow-hidden bg-slate-100">
                            <img
                              src={article.jetpack_featured_media_url}
                              alt={stripHtml(article.title.rendered)}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <p className="mb-2 text-xs font-semibold text-slate-400">{formatDate(article.date)}</p>
                          <h3 className="mb-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-secondary">
                            {stripHtml(article.title.rendered)}
                          </h3>
                          <p className="flex-1 text-sm leading-6 text-slate-500">
                            {stripHtml(article.excerpt.rendered).slice(0, 200)}…
                          </p>
                          <span className="mt-4 text-xs font-bold uppercase tracking-widest text-secondary">
                            Citește mai mult →
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Popup */}
      {showPopup && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-1 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
                </svg>
              </span>
              <h3 className="text-xl font-bold text-slate-900">Articole creștine</h3>
            </div>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Vei fi direcționat către crestintotal.ro unde găsești toate știrile și articolele creștine.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => { setShowPopup(false); window.open('https://crestintotal.ro/category/anunturi/', '_blank'); }}
                className="flex-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
              >
                Deschide crestintotal.ro
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
