import siteConfig from '@/data/site-config.json';

interface LivePlayerProps {
  videoId?: string;
  autoplay?: boolean;
}

function isServiceLive(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const windows = [
    siteConfig.serviceWindows.sundayMorning,
    siteConfig.serviceWindows.sundayEvening,
    siteConfig.serviceWindows.thursday,
  ];

  return windows.some(w => day === w.dayOfWeek && hour >= w.startHour && hour < w.endHour);
}

export default function LivePlayer({ autoplay = false }: LivePlayerProps) {
  const probablyLive = isServiceLive();
  const channelId = siteConfig.youtube.channelId;
  const liveEmbedSrc = `https://www.youtube.com/embed/live_stream?channel=${channelId}&rel=0&modestbranding=1${autoplay ? '&autoplay=1&mute=1' : ''}`;

  if (probablyLive) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-lg">
        <div className="aspect-video overflow-hidden rounded-3xl bg-slate-950">
          <iframe
            className="h-full w-full"
            src={liveEmbedSrc}
            title="Transmisie live"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          Transmisie în direct
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
      <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path d="M4 6.75A2.75 2.75 0 0 1 6.75 4h10.5A2.75 2.75 0 0 1 20 6.75v10.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25V6.75zm2.75-.25c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V6.75c0-.69-.56-1.25-1.25-1.25H6.75zM9.5 9.25l5 2.75-5 2.75V9.25z"/>
        </svg>
      </div>
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Momentan nu este transmisie live</h2>
      <p className="mx-auto max-w-xl text-sm leading-6 text-slate-500">
        Transmisiile au loc <strong>duminica dimineața și seara</strong> și <strong>joi seara</strong>. Abonează-te pe YouTube pentru notificări.
      </p>
      <a
        href={siteConfig.youtube.channelUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Abonează-te pe YouTube
      </a>
    </div>
  );
}
