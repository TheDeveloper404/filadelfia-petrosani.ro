import { Link } from 'react-router-dom';
import { useState } from 'react';
import Container from '@/components/ui/container';
import ChurchIcon from '@/components/ui/ChurchIcon';
import siteConfig from '@/data/site-config.json';

export default function Footer() {
  const [showEgg, setShowEgg] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-400">

      {/* ── Main grid ── */}
      <div className="border-b border-white/8">
        <Container className="py-14 grid gap-0 md:grid-cols-[1fr_1px_1fr_1px_1fr]">

          {/* Col 1 — Brand */}
          <div className="flex flex-col gap-4 pr-0 md:pr-10">
            <Link to="/" className="flex items-center gap-3 text-white hover:text-white w-fit">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-sm">
                <ChurchIcon className="h-7 w-7" />
              </span>
              <span className="text-lg sm:text-3xl font-bold leading-tight">{siteConfig.churchName}</span>
            </Link>
            <p className="text-xl text-slate-400 leading-relaxed">
              O comunitate vie în prezența lui Dumnezeu
            </p>
          </div>

          {/* Divider 1 */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-px h-24 bg-white/10" />
          </div>

          {/* Col 2 — Social */}
          <div className="flex flex-col items-center gap-5 px-0 md:px-10 mt-8 md:mt-0">
            <p className="text-xl font-bold uppercase tracking-[0.25em] text-secondary">Social Media</p>
            <div className="flex items-center gap-4">
              {siteConfig.social.youtube && (
                <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-secondary hover:text-secondary">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.1 0 12 0 12s0 3.9.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.9 24 12 24 12s0-3.9-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
                  </svg>
                </a>
              )}
              {siteConfig.social.facebook && (
                <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/15 text-slate-300 transition hover:border-secondary hover:text-secondary">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88V14.89h-2.54V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Divider 2 */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-px h-24 bg-white/10" />
          </div>

          {/* Col 3 — Locație */}
          <div className="flex flex-col items-center gap-3 pl-0 md:pl-10 mt-8 md:mt-0">
            <p className="text-xl font-bold uppercase tracking-[0.25em] text-secondary">Locație</p>
            <p className="flex items-start gap-2 text-lg text-slate-300 mb-3 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-1 h-5 w-5 shrink-0 text-secondary">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.083 3.218-4.212 3.218-6.878a6.75 6.75 0 0 0-13.5 0c0 2.666 1.274 4.795 3.218 6.878a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742zM12 13.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" clipRule="evenodd" />
              </svg>
              {siteConfig.contact.address}
            </p>
            <div className="overflow-hidden rounded-xl border border-white/10 h-44">
              <iframe
                title="Hartă locație"
                src={siteConfig.contact.mapEmbedUrl}
                width="100%"
                height="100%"
                className="h-full w-full grayscale opacity-80"
                style={{ border: 0, minHeight: '160px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </Container>
      </div>

      {/* ── Bottom bar ── */}
      <div className="py-4">
        <Container className="text-center text-sm text-slate-700">
          <span onClick={() => setShowEgg(e => !e)} className="cursor-default select-none">
            &copy; {new Date().getFullYear()} {siteConfig.churchName}. Toate drepturile rezervate.
          </span>
          {showEgg && (
            <span className="ml-2 text-slate-600">
              · Powered by <span className="font-semibold text-secondary">ACL Smart Software</span>
            </span>
          )}
        </Container>
      </div>

    </footer>
  );
}
