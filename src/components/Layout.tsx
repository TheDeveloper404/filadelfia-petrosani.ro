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

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [banner, setBanner] = useState<{ active: boolean; message: string } | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    dbRead<{ active: boolean; message: string }>('maintenanceBanner').then(remote => {
      if (remote && remote.active && remote.message) setBanner(remote);
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


  return (
    <div className="min-h-screen bg-slate-900 text-foreground antialiased">
      <WelcomeModal />
      <InstallPrompt />
      <a href="#main-content" className="skip-link">
        Sari la conținut
      </a>
      <Nav />
      {banner && !bannerDismissed && (
        <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-3 text-sm font-semibold text-amber-950">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>{banner.message}</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            aria-label="Închide"
            className="shrink-0 rounded-full p-1 transition hover:bg-amber-600/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
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
