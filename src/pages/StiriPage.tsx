import { useState, useEffect } from 'react';
import Container from '@/components/ui/container';
import PageMeta from '@/components/PageMeta';

const API_URL =
  'https://crestintotal.ro/wp-json/wp/v2/posts?categories=35117&per_page=4&orderby=date&order=desc&_fields=id,title,date,link,excerpt,jetpack_featured_media_url';
const CACHE_KEY = 'filadelfia_stiri_cache';
const CACHE_TTL = 48 * 60 * 60 * 1000;

interface Article {
  id: number;
  title: { rendered: string };
  date: string;
  link: string;
  excerpt: { rendered: string };
  jetpack_featured_media_url: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
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

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const articles: Article[] = await res.json();
  localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), articles }));
  return articles;
}

export default function StiriPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles()
      .then(setArticles)
      .catch(() => setError('Știrile nu pot fi încărcate momentan. Încearcă din nou mai târziu.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageMeta title="Știri — Filadelfia" description="Ultimele știri creștine de la crestintotal.ro" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-secondary/8 blur-[100px]" />
        </div>
        <Container className="relative text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Actualitate creștină
          </p>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl" style={{ color: '#d4ab84' }}>Știri</h1>
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
        <div
          className="pointer-events-none absolute top-0 inset-x-0 h-20 z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,1) 0%, rgba(15,23,42,0.35) 50%, transparent 100%)' }}
        />
        <Container>
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200/80 overflow-hidden">

            <div className="border-b border-slate-100 px-4 py-6 sm:px-10 sm:py-8 text-center">
              <p className="text-base font-semibold uppercase tracking-[0.3em]" style={{ color: '#d4ab84' }}>Selectate pentru tine</p>
              <h2 className="mt-2 text-4xl font-bold text-slate-900 sm:text-5xl">Știri recente</h2>
            </div>

            <div className="p-4 sm:p-10">
              {loading && (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
                </div>
              )}

              {error && !loading && (
                <div className="rounded-2xl bg-slate-50 py-16 text-center">
                  <p className="text-sm font-semibold text-slate-500">{error}</p>
                  <a
                    href="https://crestintotal.ro/category/stiri/"
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
                  <p className="text-sm font-semibold text-slate-500">Nicio știre disponibilă momentan.</p>
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
                          <div className="h-48 overflow-hidden bg-slate-100">
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

                  <div className="mt-8 text-center">
                    <a
                      href="https://crestintotal.ro/category/stiri/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Toate știrile pe crestintotal.ro
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </Container>
        <div
          className="pointer-events-none absolute bottom-0 inset-x-0 h-20"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(15,23,42,0.35) 60%, rgba(15,23,42,1) 100%)' }}
        />
      </section>
    </div>
  );
}
