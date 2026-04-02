import { useState, useEffect } from 'react';
import ChurchIcon from '@/components/ui/ChurchIcon';
import siteConfig from '@/data/site-config.json';

const WELCOME_KEY = 'filadelfia_welcome_shown';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(WELCOME_KEY));
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (visible) {
      const fadeTimer = setTimeout(() => setFading(true), 2200);
      const hideTimer = setTimeout(() => {
        localStorage.setItem(WELCOME_KEY, '1');
        setVisible(false);
      }, 2800);
      return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-md transition-opacity duration-600"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <div className="mx-4 flex flex-col items-center text-center max-w-lg">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20 border border-secondary/30 mb-6">
          <ChurchIcon className="h-10 w-10 text-secondary" />
        </span>

        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary mb-3">
          Bine ai venit
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          {siteConfig.churchName}
        </h1>

        <p className="text-lg text-slate-300 leading-relaxed">
          {siteConfig.tagline}
        </p>
      </div>
    </div>
  );
}
