import { useEffect, useState } from 'react';
import siteConfig from '@/data/site-config.json';

type LiveState = 'checking' | 'live' | 'offline';

export default function LivePlayer({ onStateChange }: { onStateChange?: (live: boolean) => void }) {
  const channelId = siteConfig.youtube.channelId;
  const uploadsPlaylist = channelId.replace(/^UC/, 'UU');
  const liveEmbedSrc = `https://www.youtube.com/embed/live_stream?channel=${channelId}&enablejsapi=1&rel=0&modestbranding=1`;
  const latestSrc = `https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylist}&rel=0&modestbranding=1&autoplay=0`;

  const [liveState, setLiveState] = useState<LiveState>('checking');

  useEffect(() => {
    onStateChange?.(liveState === 'live');
  }, [liveState]);

  useEffect(() => {
    let offlineTimer: ReturnType<typeof setTimeout> | null = null;

    const clearOfflineTimer = () => {
      if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null; }
    };

    const handleMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes('youtube.com')) return;
      try {
        const data = JSON.parse(event.data as string);
        if (data.event === 'infoDelivery' && data.info) {
          const isLive = data.info.videoData?.isLive;
          if (isLive === true) {
            clearOfflineTimer();
            setLiveState('live');
          } else if (isLive === false) {
            setLiveState(prev => {
              if (prev !== 'live') return 'offline';
              if (!offlineTimer) {
                offlineTimer = setTimeout(() => {
                  setLiveState('offline');
                  offlineTimer = null;
                }, 30_000);
              }
              return prev;
            });
          }
        }
        if (data.event === 'onError') {
          setLiveState(prev => prev === 'live' ? prev : 'offline');
        }
      } catch { /* ignore non-JSON */ }
    };

    window.addEventListener('message', handleMessage);
    const fallback = setTimeout(() => {
      setLiveState(prev => prev === 'checking' ? 'offline' : prev);
    }, 15_000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(fallback);
      clearOfflineTimer();
    };
  }, []);

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">
      {/* Same key always — no remount, just src change to avoid pausing */}
      <iframe
        key="player"
        className="h-full w-full"
        src={liveState === 'offline' ? latestSrc : liveEmbedSrc}
        title={liveState === 'live' ? 'Transmisie live' : 'Ultimul program'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      {liveState === 'checking' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
