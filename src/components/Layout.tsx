import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '@/components/Nav';
import { WaveDivider } from '@/components/WaveDivider';
import Footer from '@/components/Footer';
import WelcomeModal from '@/components/WelcomeModal';
import InstallPrompt from '@/components/InstallPrompt';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { dbRead, dbWrite } from '@/lib/db';

interface LayoutProps {
  children: ReactNode;
}

function MaintenancePage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 text-center">
      <img src="/logo.png" alt="Filadelfia" className="h-20 w-20 object-contain mb-8 opacity-80" />
      <div className="flex items-center gap-2 mb-6">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Site în lucru</p>
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl mb-4">
        Revenim în curând
      </h1>
      <p className="text-slate-400 text-base max-w-sm leading-7">
        {message || 'Efectuăm câteva îmbunătățiri. Vă mulțumim pentru răbdare.'}
      </p>
      <div className="mt-10 text-slate-600 text-sm">
        <p>Biserica Penticostală Filadelfia · Petroșani</p>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [maintenance, setMaintenance] = useState<{ active: boolean; message: string } | null>(null);

  useEffect(() => {
    dbRead<{ active: boolean; message: string }>('maintenanceBanner').then(remote => {
      if (remote && typeof remote === 'object') setMaintenance(remote);
    });
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('filadelfia_visited')) return;
    sessionStorage.setItem('filadelfia_visited', '1');
    const today = new Date().toISOString().slice(0, 10);
    dbRead<number>(`stats/${today}`).then(count => {
      dbWrite(`stats/${today}`, (count ?? 0) + 1);
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.key]);

  // Maintenance mode — admin can still access /admin
  const isAdmin = location.pathname === '/admin';
  if (maintenance?.active && !isAdmin) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-foreground antialiased">
      <WelcomeModal />
      <InstallPrompt />
      <a href="#main-content" className="skip-link">
        Sari la conținut
      </a>
      <Nav />
      <main key={location.key} id="main-content" className="page-enter flex-1">
        {children}
        <div className="h-[70px] bg-[#d4ab84]" aria-hidden="true" />
      </main>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 -translate-y-full">
          <WaveDivider bottomColor="#0f172a" height={70} />
        </div>
        <Footer />
      </div>
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
