import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import Container from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import siteConfig from '@/data/site-config.json';

const navLinks = [
  { to: '/', label: 'Acasă' },
  { to: '/live', label: 'Live' },
  { to: '/despre-noi', label: 'Despre noi' },
  { to: '/plan-citire', label: 'Plan Biblic' },
  { to: 'https://seminarulteologicfiladelfia.ro', label: 'Seminar Teologic', external: true },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(() => window.scrollY > 10);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingExternalUrl, setPendingExternalUrl] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-slate-900 transition-all duration-300 ${
        scrolled ? 'border-b border-white/8 shadow-lg shadow-black/20' : ''
      }`}
    >
      <Container className="flex items-center justify-between py-3 max-w-[1400px]">
        <Link to="/" className="flex items-center gap-3 text-white hover:text-white">
          <img src="/logo.png" alt="Logo Filadelfia" className="h-12 w-12 object-contain" fetchPriority="high" />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-4xl font-bold text-white">Filadelfia</span>
            <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">Biserica Penticostală</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav data-testid="desktop-nav" className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const active = !link.external && location.pathname === link.to;
            const className = `nav-link px-4 py-3 text-xl font-medium transition-colors duration-200 ${
              active ? 'nav-active text-white' : 'text-slate-300 hover:text-white'
            }`;
            return link.external ? (
              <button key={link.to} type="button" onClick={() => setPendingExternalUrl(link.to)} className={className}>
                {link.label}
              </button>
            ) : (
              <Link key={link.to} to={link.to} className={className}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Hamburger button — mobile only */}
        <button
          className="relative flex md:hidden items-center justify-center h-14 w-14 rounded-full text-slate-300 hover:text-white transition overflow-hidden active:scale-95"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Închide meniu' : 'Deschide meniu'}
        >
          <span className="absolute inset-0 rounded-full bg-white/10 scale-0 transition-transform duration-300 ease-out group-active:scale-100" />
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transition-transform duration-200 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </Container>

      {/* Mobile menu — card cu margini */}
      {menuOpen && createPortal(
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)} />,
        document.body
      )}
      <div className={`absolute left-0 right-0 top-full z-50 md:hidden px-4 pt-2 pb-4 ${!menuOpen ? 'pointer-events-none' : ''}`}>
      <div
        className={`transition-all duration-300 ${
          menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{
          background: 'rgba(10, 15, 30, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <nav className="flex flex-col p-3 gap-1">
          {navLinks.map(link => {
            const active = !link.external && location.pathname === link.to;
            const className = `rounded-2xl px-5 py-3.5 text-base font-semibold transition-all ${
              active ? 'bg-secondary/20 text-secondary' : 'text-slate-300 hover:bg-white/8 hover:text-white'
            }`;
            return link.external ? (
              <button
                key={link.to}
                type="button"
                onClick={() => { setMenuOpen(false); setPendingExternalUrl(link.to); }}
                className={`text-left ${className}`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={className}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      </div>

      {pendingExternalUrl && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setPendingExternalUrl(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">Vei fi direcționat către un alt site</h2>
            <p className="mt-2 text-sm text-slate-600">
              Vei fi direcționat către <span className="font-semibold">{pendingExternalUrl.replace(/^https?:\/\//, '')}</span>, site-ul Seminarului Teologic Filadelfia.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setPendingExternalUrl(null)}>
                Anulează
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.open(pendingExternalUrl, '_blank', 'noopener,noreferrer');
                  setPendingExternalUrl(null);
                }}
              >
                Continuă
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
