import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from '@/components/ui/container';
import siteConfig from '@/data/site-config.json';

const navLinks = [
  { to: '/', label: 'Acasă' },
  { to: '/live', label: 'Live' },
  { to: '/stiri', label: 'Știri' },
  { to: '/plan-citire', label: 'Plan Biblic' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const isHome = location.pathname === '/';
  const transparentMobile = isHome && !scrolled;

  return (
    <header
      className={`top-0 z-50 transition-all duration-300 ${
        transparentMobile ? 'absolute md:sticky' : 'sticky'
      } ${
        scrolled || menuOpen
          ? 'bg-slate-900 border-b border-white/8 shadow-lg shadow-black/20'
          : isHome
            ? 'bg-transparent md:bg-slate-900'
            : 'bg-slate-900'
      }`}
      style={{ width: '100%' }}
    >
      <Container className="flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-white hover:text-white">
          <img src="/logo.png" alt="Logo Filadelfia" className="h-12 w-12 object-contain" />
          <span className="hidden sm:inline text-2xl sm:text-4xl">{siteConfig.churchName}</span>
        </Link>

        {/* Desktop nav */}
        <nav data-testid="desktop-nav" className="hidden md:flex items-center gap-1">
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link px-4 py-3 text-lg font-medium transition-colors duration-200 ${
                  active ? 'nav-active text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
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
      <div className="absolute left-0 right-0 top-full z-50 md:hidden px-4 pt-2 pb-4">
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
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-2xl px-5 py-3.5 text-base font-semibold transition-all ${
                  active ? 'bg-secondary/20 text-secondary' : 'text-slate-300 hover:bg-white/8 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      </div>
    </header>
  );
}
