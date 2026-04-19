import { useEffect, useState } from 'react';
import siteConfig from '@/data/site-config.json';

type LiveState = 'checking' | 'live' | 'offline';

interface LiveStatus {
  isLive: boolean;
  videoId: string | null;
  title: string | null;
}

const uploadsPlaylist = siteConfig.youtube.channelId.replace(/^UC/, 'UU');
const latestSrc = `https://www.youtube.com/embed?listType=playlist&list=${uploadsPlaylist}&rel=0&modestbranding=1&autoplay=0`;

export default function LivePlayer({ onStateChange }: { onStateChange?: (live: boolean) => void }) {
  const [liveState, setLiveState] = useState<LiveState>('checking');
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/live-status')
      .then(r => r.json() as Promise<LiveStatus>)
      .then(data => {
        if (cancelled) return;
        if (data.isLive && data.videoId) {
          setVideoId(data.videoId);
          setLiveState('live');
        } else {
          setLiveState('offline');
        }
      })
      .catch(() => {
        if (!cancelled) setLiveState('offline');
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    onStateChange?.(liveState === 'live');
  }, [liveState]);

  const liveSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950">
      <iframe
        key="player"
        className="h-full w-full"
        src={liveState === 'live' && liveSrc ? liveSrc : latestSrc}
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
