import { Link } from 'react-router-dom';
import Container from '@/components/ui/container';
import ChurchIcon from '@/components/ui/ChurchIcon';
import siteConfig from '@/data/site-config.json';

const socialIcons = {
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.1 0 12 0 12s0 3.9.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.9 24 12 24 12s0-3.9-.5-5.81zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88V14.89h-2.54V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
    </svg>
  ),
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <Container className="grid gap-8 py-8 md:grid-cols-3">

        {/* Brand */}
        <div className="flex flex-col gap-3">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow">
              <ChurchIcon className="h-6 w-6" />
            </span>
            {siteConfig.churchName}
          </Link>
          <div className="flex flex-wrap gap-2">
            {Object.entries(siteConfig.social).map(([key, url]) =>
              url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-400 transition hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary"
                  aria-label={key}
                >
                  {socialIcons[key as 'youtube' | 'facebook']}
                </a>
              ) : null,
            )}
          </div>
        </div>

        {/* Pages */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Pagini</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
            {[
              { to: '/', label: 'Acasă' },
              { to: '/live', label: 'Live' },
              { to: '/stiri', label: 'Știri' },
              { to: '/plan-citire', label: 'Plan Biblic' },
              { href: `${siteConfig.youtube.channelUrl}/streams`, label: 'Arhivă' },
              { to: '/contact', label: 'Contact' },
            ].map(link =>
              'href' in link ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="text-slate-300 transition hover:text-secondary">
                  {link.label}
                </a>
              ) : (
                <Link key={link.to} to={link.to} className="text-slate-300 transition hover:text-secondary">
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Contact</p>
          <div className="space-y-2 text-sm text-slate-300">
            {siteConfig.contact.address && (
              <p className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-2.083 3.218-4.212 3.218-6.878a6.75 6.75 0 0 0-13.5 0c0 2.666 1.274 4.795 3.218 6.878a19.58 19.58 0 0 0 2.683 2.282 16.975 16.975 0 0 0 1.144.742zM12 13.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5z" clipRule="evenodd" />
                </svg>
                {siteConfig.contact.address}
              </p>
            )}
            {siteConfig.contact.phone && (
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-secondary">
                  <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                </svg>
                <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className="transition hover:text-secondary">
                  {siteConfig.contact.phone}
                </a>
              </p>
            )}
            {siteConfig.contact.email && (
              <p className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-secondary">
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
                </svg>
                <a href={`mailto:${siteConfig.contact.email}`} className="transition hover:text-secondary">
                  {siteConfig.contact.email}
                </a>
              </p>
            )}
          </div>
        </div>

      </Container>

      <div className="border-t border-white/8 py-4">
        <Container className="text-center text-xs text-slate-600">
          &copy; {new Date().getFullYear()} {siteConfig.churchName}. Toate drepturile rezervate.
        </Container>
      </div>
    </footer>
  );
}
