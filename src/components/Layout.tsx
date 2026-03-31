import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import NewsTicker from '@/components/NewsTicker';
import WelcomeModal from '@/components/WelcomeModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.key]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const timeout = setTimeout(() => {
      document.querySelectorAll('section').forEach(el => {
        el.classList.add('scroll-reveal');
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [location.key]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <WelcomeModal />
      <a href="#main-content" className="skip-link">
        Sari la conținut
      </a>
      <Nav />
      <NewsTicker />
      <main key={location.key} id="main-content" className="page-enter flex-1 -mt-[52px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
