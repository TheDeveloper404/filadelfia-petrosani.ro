import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from '@/components/ui/container';
import ChurchIcon from '@/components/ui/ChurchIcon';
import siteConfig from '@/data/site-config.json';

const navLinks = [
  { to: '/', label: 'Acasă' },
  { to: '/live', label: 'Live' },
];

const navLinksAfter = [
  { to: '/stiri', label: 'Știri' },
  { to: '/plan-citire', label: 'Plan Biblic' },
  { to: '/contact', label: 'Contact' },
];

export default function Nav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPopup(true);
  };

  const handleConfirm = () => {
    setShowPopup(false);
    window.open(`${siteConfig.youtube.channelUrl}/streams`, '_blank');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-slate-900/95 backdrop-blur-xl border-b border-white/8 shadow-lg shadow-black/20'
            : 'bg-slate-900'
        }`}
      >
        <Container className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-white hover:text-white">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
              <ChurchIcon className="h-7 w-7" />
            </span>
            <span className="hidden sm:block">{siteConfig.churchName}</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link px-8 py-4.5 text-base font-medium transition-colors duration-200 ${
                    active ? 'nav-active text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Arhivă — după Live */}
            <a
              href="#"
              onClick={handleArchiveClick}
              className="nav-link px-8 py-4.5 text-base font-medium transition-colors duration-200 text-slate-300 hover:text-white"
            >
              Arhivă
            </a>

            {navLinksAfter.map(link => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link px-8 py-4.5 text-base font-medium transition-colors duration-200 ${
                    active ? 'nav-active text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </header>

      {/* Popup confirmare */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPopup(false)} />
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-1 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.1 0 12 0 12s0 3.9.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.9 24 12 24 12s0-3.9-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
                </svg>
              </span>
              <h3 className="text-xl font-bold text-slate-900">Arhivă predici</h3>
            </div>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Vei fi direcționat către canalul nostru de YouTube unde găsești toate predicile și transmisiile live anterioare.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:bg-secondary/90"
              >
                Deschide YouTube
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
