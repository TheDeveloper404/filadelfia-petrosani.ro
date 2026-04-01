import { useState, useEffect } from 'react';
import { dbRead } from '@/lib/db';

const STORAGE_KEY = 'filadelfia_ticker';

interface TickerConfig {
  enabled: boolean;
  text: string;
}

export default function NewsTicker() {
  const [config, setConfig] = useState<TickerConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { enabled: false, text: '' };
  });

  useEffect(() => {
    dbRead<TickerConfig>('ticker').then(remote => {
      if (remote !== undefined) {
        const val = remote ?? { enabled: false, text: '' };
        setConfig(val);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val));
      }
    });
  }, []);

  if (!config.enabled || !config.text.trim()) return null;

  return (
    <div className="overflow-hidden bg-white/10 backdrop-blur-md border-y border-white/15 py-3 text-white relative z-10">
      <div className="ticker-track flex whitespace-nowrap">
        {[0, 1, 2].map(i => (
          <span key={i} className="inline-block px-6 sm:px-16 text-base font-semibold tracking-wide" aria-hidden={i > 0 ? true : undefined}>
            {config.text}
          </span>
        ))}
      </div>
    </div>
  );
}
