import { useState, useEffect } from 'react';
import { dbRead } from '@/lib/db';

const STORAGE_KEY = 'filadelfia_ticker';

interface TickerConfig {
  enabled: boolean;
  text: string;
}

export default function NewsTicker() {
  const [config, setConfig] = useState<TickerConfig>({ enabled: false, text: '' });

  useEffect(() => {
    dbRead<TickerConfig>('ticker').then(remote => {
      if (remote) {
        setConfig(remote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      }
    });
  }, []);

  if (!config.enabled || !config.text.trim()) return null;

  return (
    <div className="overflow-hidden bg-secondary py-1.5 text-secondary-foreground">
      <div className="ticker-track flex whitespace-nowrap">
        <span className="inline-block px-6 sm:px-16 text-sm font-semibold">
          {config.text}
        </span>
        <span className="inline-block px-6 sm:px-16 text-sm font-semibold" aria-hidden>
          {config.text}
        </span>
      </div>
    </div>
  );
}
