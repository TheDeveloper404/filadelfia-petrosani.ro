import { useEffect } from 'react';
import siteConfig from '@/data/site-config.json';

export default function ArchivePage() {
  useEffect(() => {
    window.location.replace(`${siteConfig.social.youtube}/streams`);
  }, []);

  return null;
}
