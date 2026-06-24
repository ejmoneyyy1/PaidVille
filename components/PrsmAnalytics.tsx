'use client';

import {usePathname} from 'next/navigation';
import {useEffect} from 'react';

/**
 * PRSM Analytics beacon. Fires a cookieless pageview to the PRSM collector on
 * first load AND every client-side route change — usePathname re-runs the
 * effect on each soft navigation, which a one-shot <script> tag would miss on
 * a Next.js App Router site. Query-string changes are intentionally not
 * tracked (would need useSearchParams + Suspense; not worth it for pageviews).
 */
export default function PrsmAnalytics({slug}: {slug: string}) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      navigator.sendBeacon(
        'https://studio.prsmstudios.io/api/collect',
        JSON.stringify({s: slug, p: pathname, r: document.referrer}),
      );
    } catch {
      // Beacon is best-effort; never let analytics break the page.
    }
  }, [slug, pathname]);

  return null;
}
