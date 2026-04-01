import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '@/components/Nav';
import { WaveDivider } from '@/components/WaveDivider';
import Footer from '@/components/Footer';
import WelcomeModal from '@/components/WelcomeModal';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.key]);


  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <WelcomeModal />
      <a href="#main-content" className="skip-link">
        Sari la conținut
      </a>
      <Nav />
      <main key={location.key} id="main-content" className="page-enter flex-1">
        {children}
      </main>
      <WaveDivider topColor="#d4ab84" bottomColor="#0f172a" height={70} />
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
